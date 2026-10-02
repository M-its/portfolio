import { clientIp, hex, readLimitedBody, signature } from "./security.ts";

export type Contact = { name: string | null; email: string; message: string };
export type Dependencies = {
  env: (key: string) => string | undefined;
  fetch: typeof fetch;
  limit: (
    key: string,
    minute: number,
    hour: number,
  ) => Promise<{ allowed: boolean; retry_after: number }>;
  save: (contact: Contact) => Promise<void>;
  notify: (contact: Contact) => Promise<boolean>;
};

const origins = new Set([
  "https://mitsrael.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

function positiveInteger(value: string | undefined, fallback: number) {
  if (value === undefined) return fallback;
  if (
    !/^\d+$/.test(value) ||
    !Number.isSafeInteger(Number(value)) ||
    Number(value) < 1 ||
    Number(value) > 1000
  )
    throw new Error("Invalid rate limit");
  return Number(value);
}

export function createHandler(deps: Dependencies) {
  return async (request: Request): Promise<Response> => {
    const origin = request.headers.get("origin");
    const headers: Record<string, string> = {
      "Access-Control-Allow-Origin":
        origin && origins.has(origin) ? origin : "https://mitsrael.vercel.app",
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Expose-Headers": "Retry-After",
      "Cache-Control": "no-store",
      Vary: "Origin",
    };
    const reply = (status: number, code: string, extra = {}) =>
      Response.json({ error: code, ...extra }, { status, headers });
    if (request.method === "OPTIONS") return new Response("ok", { headers });
    if (request.method !== "POST") return reply(405, "method_not_allowed");
    try {
      const proxySecret = deps.env("CONTACT_PROXY_SECRET");
      const turnstileSecret = deps.env("TURNSTILE_SECRET_KEY");
      const hostnames = (deps.env("TURNSTILE_HOSTNAMES") ?? "")
        .split(",")
        .map((host) => host.trim())
        .filter(Boolean);
      if (
        !proxySecret ||
        proxySecret.length < 32 ||
        !turnstileSecret ||
        !hostnames.length
      )
        return reply(503, "service_unavailable");
      const ip = await clientIp(request, proxySecret);
      if (!ip) return reply(403, "untrusted_client");
      const key = hex(await signature(proxySecret, `rate-limit\n${ip}`));
      const decision = await deps.limit(
        key,
        positiveInteger(deps.env("CONTACT_LIMIT_PER_MINUTE"), 3),
        positiveInteger(deps.env("CONTACT_LIMIT_PER_HOUR"), 10),
      );
      if (
        typeof decision?.allowed !== "boolean" ||
        !Number.isFinite(decision.retry_after)
      )
        throw new Error("Invalid limiter response");
      if (!decision.allowed) {
        headers["Retry-After"] = String(
          Math.max(1, Math.ceil(decision.retry_after)),
        );
        return reply(429, "rate_limited", {
          retryAfter: Number(headers["Retry-After"]),
        });
      }
      let body: unknown;
      try {
        body = JSON.parse(await readLimitedBody(request));
      } catch (error) {
        return reply(
          error instanceof RangeError ? 413 : 400,
          "invalid_payload",
        );
      }
      if (!body || typeof body !== "object" || Array.isArray(body))
        return reply(400, "invalid_payload");
      const payload = body as Record<string, unknown>;
      if (
        (payload.name !== undefined && typeof payload.name !== "string") ||
        typeof payload.email !== "string" ||
        typeof payload.message !== "string"
      )
        return reply(400, "invalid_payload");
      const contact: Contact = {
        name:
          typeof payload.name === "string" ? payload.name.trim() || null : null,
        email: payload.email.trim().toLowerCase(),
        message: payload.message.trim(),
      };
      if (
        !/^\S+@\S+\.\S+$/.test(contact.email) ||
        !contact.message ||
        (contact.name?.length ?? 0) > 100 ||
        contact.email.length > 254 ||
        contact.message.length > 3000
      )
        return reply(400, "invalid_payload");
      const token = payload.turnstileToken;
      if (typeof token !== "string" || !token.trim() || token.length > 2048)
        return reply(400, "verification_required");
      let verification: Record<string, unknown>;
      try {
        const response = await deps.fetch(
          "https://challenges.cloudflare.com/turnstile/v0/siteverify",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              secret: turnstileSecret,
              response: token,
              remoteip: ip,
            }),
            signal: AbortSignal.timeout(8000),
          },
        );
        if (!response.ok) return reply(503, "verification_unavailable");
        const result: unknown = await response.json();
        if (!result || typeof result !== "object" || Array.isArray(result))
          return reply(503, "verification_unavailable");
        verification = result as Record<string, unknown>;
      } catch {
        return reply(503, "verification_unavailable");
      }
      const codes = verification["error-codes"];
      if (
        Array.isArray(codes) &&
        codes.some((code) =>
          [
            "internal-error",
            "missing-input-secret",
            "invalid-input-secret",
          ].includes(code),
        )
      )
        return reply(503, "verification_unavailable");
      if (verification.success !== true)
        return reply(
          400,
          Array.isArray(codes) && codes.includes("timeout-or-duplicate")
            ? "verification_expired"
            : "verification_invalid",
        );
      if (
        verification.action !== "contact" ||
        typeof verification.hostname !== "string" ||
        !hostnames.includes(verification.hostname)
      )
        return reply(400, "verification_invalid");
      await deps.save(contact);
      let notificationSent = false;
      try {
        notificationSent = await deps.notify(contact);
      } catch {
        console.error("Contact notification failed");
      }
      return Response.json({ ok: true, notificationSent }, { headers });
    } catch {
      console.error("Contact service unavailable");
      return reply(503, "service_unavailable");
    }
  };
}

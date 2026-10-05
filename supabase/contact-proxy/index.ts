import {
  hex,
  normalizeIp,
  readLimitedBody,
  signature,
} from "../functions/submit-contact/security.ts";

type Env = { CONTACT_PROXY_SECRET: string; SUPABASE_CONTACT_URL: string };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("origin") ?? "";
    const headers = {
      "Access-Control-Allow-Origin": [
        "https://mitsrael.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
      ].includes(origin)
        ? origin
        : "https://mitsrael.vercel.app",
      "Access-Control-Allow-Headers": "content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Expose-Headers": "Retry-After",
      Vary: "Origin",
      "Cache-Control": "no-store",
    };
    if (request.method === "OPTIONS") return new Response("ok", { headers });
    if (request.method !== "POST")
      return Response.json(
        { error: "method_not_allowed" },
        { status: 405, headers },
      );
    // Cloudflare supplies this header. Client-supplied forwarding/signature headers are never copied.
    const ip = normalizeIp(request.headers.get("cf-connecting-ip") ?? "");
    if (
      !ip ||
      !env.CONTACT_PROXY_SECRET ||
      env.CONTACT_PROXY_SECRET.length < 32 ||
      !env.SUPABASE_CONTACT_URL
    ) {
      console.error("Contact proxy unavailable", {
        stage: "configuration",
        validClientIp: Boolean(ip),
        validProxySecret: Boolean(
          env.CONTACT_PROXY_SECRET && env.CONTACT_PROXY_SECRET.length >= 32,
        ),
        configuredUpstream: Boolean(env.SUPABASE_CONTACT_URL),
      });
      return Response.json(
        { error: "service_unavailable" },
        { status: 503, headers },
      );
    }
    try {
      const body = await readLimitedBody(request);
      const timestamp = String(Date.now());
      const response = await fetch(env.SUPABASE_CONTACT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin,
          "x-contact-ip": ip,
          "x-contact-timestamp": timestamp,
          "x-contact-signature": hex(
            await signature(env.CONTACT_PROXY_SECRET, `${timestamp}\n${ip}`),
          ),
        },
        body,
        signal: AbortSignal.timeout(20_000),
        // workerd supports manual/follow, not the browser's "error" mode.
        redirect: "manual",
      });
      if (response.status >= 300 && response.status < 400) {
        console.error("Contact proxy unavailable", {
          stage: "upstream_redirect",
        });
        return Response.json(
          { error: "service_unavailable" },
          { status: 503, headers },
        );
      }
      return response;
    } catch (error) {
      console.error("Contact proxy unavailable", {
        stage:
          error instanceof RangeError ? "request_body" : "upstream_request",
        errorType: error instanceof Error ? error.name : "UnknownError",
      });
      return Response.json(
        {
          error:
            error instanceof RangeError
              ? "invalid_payload"
              : "service_unavailable",
        },
        { status: error instanceof RangeError ? 413 : 503, headers },
      );
    }
  },
};

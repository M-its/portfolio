import { describe, expect, it, vi } from "vitest";
import {
  createHandler,
  type Dependencies,
} from "../supabase/functions/submit-contact/handler";
import { hex, signature } from "../supabase/functions/submit-contact/security";
import proxy from "../supabase/contact-proxy/index";

const secret = "a-test-secret-with-more-than-32-characters";
const valid = {
  email: "Visitor@example.com",
  message: "Hello",
  turnstileToken: "token",
};
function setup() {
  const env: Record<string, string> = {
    CONTACT_PROXY_SECRET: secret,
    TURNSTILE_SECRET_KEY: "test-secret",
    TURNSTILE_HOSTNAMES: "mitsrael.vercel.app",
  };
  const deps: Dependencies = {
    env: (key) => env[key],
    fetch: vi.fn(async () =>
      Response.json({
        success: true,
        hostname: "mitsrael.vercel.app",
        action: "contact",
      }),
    ),
    limit: vi.fn(async () => ({ allowed: true, retry_after: 0 })),
    save: vi.fn(async () => {}),
    notify: vi.fn(async () => true),
  };
  return { deps, env, handler: createHandler(deps) };
}
async function request(
  body: unknown = valid,
  overrides: Record<string, string> = {},
  signed = true,
) {
  const timestamp = String(Date.now());
  return new Request(
    "https://project.supabase.co/functions/v1/submit-contact",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(signed
          ? {
              "x-contact-ip": "203.0.113.1",
              "x-contact-timestamp": timestamp,
              "x-contact-signature": hex(
                await signature(secret, `${timestamp}\n203.0.113.1`),
              ),
            }
          : {}),
        ...overrides,
      },
      body: JSON.stringify(body),
    },
  );
}
function noEffects(deps: Dependencies) {
  expect(deps.save).not.toHaveBeenCalled();
  expect(deps.notify).not.toHaveBeenCalled();
}

describe("contact server protections", () => {
  it("accepts a signed direct request with valid verification and saves before notifying", async () => {
    const { deps, handler } = setup();
    const response = await handler(await request());
    expect(response.status).toBe(200);
    expect(deps.save).toHaveBeenCalledWith({
      name: null,
      email: "visitor@example.com",
      message: "Hello",
    });
    expect(deps.notify).toHaveBeenCalledOnce();
    expect(vi.mocked(deps.save).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(deps.notify).mock.invocationCallOrder[0],
    );
    expect(deps.limit).toHaveBeenCalledWith(
      expect.stringMatching(/^[a-f0-9]{64}$/),
      3,
      10,
    );
  });
  it.each([undefined, "", 12, "x".repeat(2049)])(
    "rejects missing/malformed token %s",
    async (turnstileToken) => {
      const { deps, handler } = setup();
      expect(
        (await handler(await request({ ...valid, turnstileToken }))).status,
      ).toBe(400);
      expect(deps.fetch).not.toHaveBeenCalled();
      noEffects(deps);
    },
  );
  it.each([
    { success: false, "error-codes": ["invalid-input-response"] },
    { success: false, "error-codes": ["timeout-or-duplicate"] },
    { success: true, hostname: "evil.example", action: "contact" },
    { success: true, hostname: "mitsrael.vercel.app", action: "other" },
  ])(
    "rejects invalid, expired and wrong-site verification",
    async (verification) => {
      const { deps, handler } = setup();
      vi.mocked(deps.fetch).mockResolvedValue(Response.json(verification));
      expect((await handler(await request())).status).toBe(400);
      noEffects(deps);
    },
  );
  it("returns 429 before CAPTCHA, storage or Resend and respects configurable limits", async () => {
    const { deps, env, handler } = setup();
    env.CONTACT_LIMIT_PER_MINUTE = "5";
    env.CONTACT_LIMIT_PER_HOUR = "20";
    vi.mocked(deps.limit).mockResolvedValue({
      allowed: false,
      retry_after: 42,
    });
    const response = await handler(await request());
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("42");
    expect(deps.limit).toHaveBeenCalledWith(expect.any(String), 5, 20);
    expect(deps.fetch).not.toHaveBeenCalled();
    noEffects(deps);
  });
  it.each(["timeout", "http", "malformed", "internal-error"])(
    "fails closed on verification failure: %s",
    async (failure) => {
      const { deps, handler } = setup();
      if (failure === "timeout")
        vi.mocked(deps.fetch).mockRejectedValue(new Error("timeout"));
      else
        vi.mocked(deps.fetch).mockResolvedValue(
          failure === "http"
            ? new Response("", { status: 500 })
            : failure === "malformed"
              ? new Response("not JSON")
              : Response.json({ success: false, "error-codes": [failure] }),
        );
      expect((await handler(await request())).status).toBe(503);
      noEffects(deps);
    },
  );
  it("fails closed when storage of limits is unavailable", async () => {
    const { deps, handler } = setup();
    vi.mocked(deps.limit).mockRejectedValue(new Error("database unavailable"));
    expect((await handler(await request())).status).toBe(503);
    noEffects(deps);
  });
  it("does not notify when saving fails", async () => {
    const { deps, handler } = setup();
    vi.mocked(deps.save).mockRejectedValue(new Error("database unavailable"));
    expect((await handler(await request())).status).toBe(503);
    expect(deps.notify).not.toHaveBeenCalled();
  });
  it("reports accepted storage when notification fails, avoiding duplicate retry", async () => {
    const { deps, handler } = setup();
    vi.mocked(deps.notify).mockRejectedValue(new Error("Resend unavailable"));
    const response = await handler(await request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      notificationSent: false,
    });
  });
  it("rejects direct requests and fabricated forwarding headers", async () => {
    const { deps, handler } = setup();
    expect(
      (
        await handler(
          await request(
            valid,
            {
              "x-forwarded-for": "203.0.113.1",
              "cf-connecting-ip": "203.0.113.1",
            },
            false,
          ),
        )
      ).status,
    ).toBe(403);
    expect(
      (await handler(await request(valid, { "x-contact-ip": "203.0.113.2" })))
        .status,
    ).toBe(403);
    expect(
      (
        await handler(
          await request(valid, {
            "x-contact-timestamp": String(Date.now() - 120_000),
          }),
        )
      ).status,
    ).toBe(403);
    noEffects(deps);
    expect(deps.limit).not.toHaveBeenCalled();
  });
  it.each([
    null,
    [],
    { ...valid, name: 5 },
    { ...valid, message: "" },
    { ...valid, message: "x".repeat(3001) },
  ])("rejects malformed payload", async (body) => {
    const { deps, handler } = setup();
    expect((await handler(await request(body))).status).toBe(400);
    noEffects(deps);
  });
  it("bounds request size without trusting content-length", async () => {
    const { deps, handler } = setup();
    expect(
      (await handler(await request({ ...valid, message: "x".repeat(20000) })))
        .status,
    ).toBe(413);
    noEffects(deps);
  });
  it("fails closed with missing config or invalid limits", async () => {
    const { deps, env, handler } = setup();
    env.CONTACT_LIMIT_PER_MINUTE = "NaN";
    expect((await handler(await request())).status).toBe(503);
    delete env.TURNSTILE_SECRET_KEY;
    expect((await handler(await request())).status).toBe(503);
    noEffects(deps);
  });
  it("allows preflight and refuses other methods without side effects", async () => {
    const { deps, handler } = setup();
    expect(
      (await handler(new Request("https://example.com", { method: "OPTIONS" })))
        .status,
    ).toBe(200);
    expect((await handler(new Request("https://example.com"))).status).toBe(
      405,
    );
    expect(deps.limit).not.toHaveBeenCalled();
    noEffects(deps);
  });
  it("proxy overwrites forged identity and forwards only the platform IP", async () => {
    const { handler, deps } = setup();
    const original = globalThis.fetch;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url, options) =>
        handler(new Request(url as string, options)),
      ),
    );
    try {
      const response = await proxy.fetch(
        await request(valid, {
          "cf-connecting-ip": "198.51.100.7",
          "x-contact-ip": "forged",
        }),
        {
          CONTACT_PROXY_SECRET: secret,
          SUPABASE_CONTACT_URL:
            "https://project.supabase.co/functions/v1/submit-contact",
        },
      );
      expect(response.status).toBe(200);
      expect(deps.limit).toHaveBeenCalledWith(
        hex(await signature(secret, "rate-limit\n198.51.100.7")),
        3,
        10,
      );
    } finally {
      vi.stubGlobal("fetch", original);
    }
  });
});

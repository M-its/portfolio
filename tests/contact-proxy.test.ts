import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import proxy from "../supabase/contact-proxy/index";

const env = {
  CONTACT_PROXY_SECRET: "private-test-proxy-secret-at-least-32-characters",
  SUPABASE_CONTACT_URL: "https://upstream.example.com/contact",
};
function request(ip = "198.51.100.240") {
  return new Request("https://contact.example.com", {
    method: "POST",
    headers: { "cf-connecting-ip": ip, "Content-Type": "application/json" },
    body: "{}",
  });
}
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("contact proxy diagnostics", () => {
  it("identifies a short binding without forwarding or logging its value", async () => {
    const response = await proxy.fetch(request(), {
      ...env,
      CONTACT_PROXY_SECRET: "short-private-value",
    });
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "service_unavailable" });
    expect(fetch).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith("Contact proxy unavailable", {
      stage: "configuration",
      validClientIp: true,
      validProxySecret: false,
      configuredUpstream: true,
    });
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain(
      "short-private-value",
    );
  });
  it("distinguishes upstream network failure from local configuration failure", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("fetch failed"));
    const response = await proxy.fetch(request(), env);
    expect(response.status).toBe(503);
    expect(console.error).toHaveBeenCalledWith("Contact proxy unavailable", {
      stage: "upstream_request",
      errorType: "TypeError",
    });
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain(
      env.CONTACT_PROXY_SECRET,
    );
  });
  it("preserves upstream verification errors without attributing them to the Worker", async () => {
    vi.mocked(fetch).mockResolvedValue(
      Response.json({ error: "verification_unavailable" }, { status: 503 }),
    );
    const response = await proxy.fetch(request(), env);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "verification_unavailable",
    });
    expect(console.error).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(
      env.SUPABASE_CONTACT_URL,
      expect.objectContaining({ redirect: "manual" }),
    );
  });
  it("refuses upstream redirects instead of forwarding signed headers to another destination", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, {
        status: 302,
        headers: { Location: "https://other.example.com" },
      }),
    );
    const response = await proxy.fetch(request(), env);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "service_unavailable" });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith("Contact proxy unavailable", {
      stage: "upstream_redirect",
    });
  });
});

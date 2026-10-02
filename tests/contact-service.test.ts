import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const message = {
  email: "visitor@example.com",
  message: "Hello",
  turnstileToken: "token",
};
beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("VITE_CONTACT_ENDPOINT", "https://contact.example.com");
  vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("frontend contact response handling", () => {
  it("sends the token to the public proxy and accepts a valid response", async () => {
    vi.mocked(fetch).mockResolvedValue(Response.json({ ok: true }));
    const { sendContactMessage } = await import("../src/utils/contact-service");
    await sendContactMessage(message);
    expect(fetch).toHaveBeenCalledWith(
      "https://contact.example.com",
      expect.objectContaining({
        body: JSON.stringify(message),
        headers: { "Content-Type": "application/json" },
      }),
    );
  });
  it.each([
    [429, "rate_limited", "42 segundos"],
    [400, "verification_expired", "expirada"],
    [400, "verification_invalid", "verificação novamente"],
    [400, "verification_required", "verificação novamente"],
    [503, "verification_unavailable", "indisponível"],
    [403, "untrusted_client", "indisponível"],
  ])("shows actionable feedback for %s %s", async (status, error, feedback) => {
    vi.mocked(fetch).mockResolvedValue(
      Response.json({ error }, { status, headers: { "Retry-After": "42" } }),
    );
    const { sendContactMessage } = await import("../src/utils/contact-service");
    await expect(sendContactMessage(message)).rejects.toThrow(feedback);
  });
  it("handles proxy failures without a JSON body", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response("gateway unavailable", { status: 503 }),
    );
    const { sendContactMessage } = await import("../src/utils/contact-service");
    await expect(sendContactMessage(message)).rejects.toThrow("indisponível");
  });
  it("handles network/timeout errors with a retry message", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network"));
    const { sendContactMessage } = await import("../src/utils/contact-service");
    await expect(sendContactMessage(message)).rejects.toThrow(
      "Sua mensagem foi preservada",
    );
  });
});

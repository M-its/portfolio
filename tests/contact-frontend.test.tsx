// @vitest-environment happy-dom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ContactChat from "../src/core-components/contact-chat";
import ContactVerification from "../src/components/contact-verification";
import { sendContactMessage } from "../src/utils/contact-service";

vi.mock("../src/utils/contact-service", () => ({
  sendContactMessage: vi.fn(),
}));
vi.mock("../src/hooks/use-media-query", () => ({ default: () => false }));
type WidgetOptions = {
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
};
let widget: WidgetOptions;
beforeEach(() => {
  // Happy DOM cancels native animation promises differently from browsers.
  // Exercise the real form with Motion's JavaScript animation fallback.
  Reflect.deleteProperty(Element.prototype, "animate");
  vi.stubEnv("VITE_TURNSTILE_SITE_KEY", "test-sitekey");
  window.turnstile = {
    render: vi.fn((_container, options) => {
      widget = options;
      return "widget";
    }),
    remove: vi.fn(),
  };
  vi.mocked(sendContactMessage).mockReset();
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  delete window.turnstile;
});
async function openAndFill() {
  render(<ContactChat />);
  fireEvent.click(screen.getByRole("button", { name: "Abrir conversa" }));
  await waitFor(() => expect(window.turnstile?.render).toHaveBeenCalled());
  fireEvent.change(screen.getByLabelText("Seu e-mail"), {
    target: { value: "visitor@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Mensagem"), {
    target: { value: "My message to preserve" },
  });
}
function checkMessage() {
  expect((screen.getByLabelText("Mensagem") as HTMLTextAreaElement).value).toBe(
    "My message to preserve",
  );
  expect((screen.getByLabelText("Seu e-mail") as HTMLInputElement).value).toBe(
    "visitor@example.com",
  );
}

describe("contact retry UX", () => {
  it("shows unavailable verification with no public key", async () => {
    vi.stubEnv("VITE_TURNSTILE_SITE_KEY", "");
    const onToken = vi.fn();
    render(<ContactVerification onToken={onToken} />);
    expect(screen.getByRole("status").textContent).toContain("indisponível");
    expect(onToken).toHaveBeenCalledWith("");
    expect(window.turnstile?.render).not.toHaveBeenCalled();
  });
  it("recovers from script-load failure using the retry control", async () => {
    const api = window.turnstile;
    delete window.turnstile;
    const onToken = vi.fn();
    render(<ContactVerification onToken={onToken} />);
    // Happy DOM refuses external script loading and dispatches an error itself.
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toContain("indisponível"),
    );
    window.turnstile = api;
    fireEvent.click(
      screen.getByRole("button", { name: "Verificar novamente" }),
    );
    await waitFor(() => expect(api?.render).toHaveBeenCalled());
    act(() => widget.callback("new-token"));
    expect(onToken).toHaveBeenLastCalledWith("new-token");
  });
  it("preserves the form on rate limit, obtains a fresh token and retries successfully", async () => {
    vi.mocked(sendContactMessage)
      .mockRejectedValueOnce(
        new Error(
          "Limite de tentativas atingido. Tente novamente em 42 segundos.",
        ),
      )
      .mockResolvedValueOnce(undefined);
    await openAndFill();
    act(() => widget.callback("first-token"));
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    await screen.findByRole("alert");
    checkMessage();
    await waitFor(() =>
      expect(window.turnstile?.render).toHaveBeenCalledTimes(2),
    );
    act(() => widget.callback("fresh-token"));
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    await screen.findByText(/Recebi sua mensagem|Mensagem recebida/);
    expect(sendContactMessage).toHaveBeenLastCalledWith({
      name: undefined,
      email: "visitor@example.com",
      message: "My message to preserve",
      turnstileToken: "fresh-token",
    });
  });
  it("blocks missing/expired verification and renews it without clearing text", async () => {
    await openAndFill();
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    expect(sendContactMessage).not.toHaveBeenCalled();
    checkMessage();
    act(() => {
      widget.callback("old-token");
      widget["expired-callback"]();
    });
    expect(screen.getByRole("status").textContent).toContain("expirada");
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    expect(sendContactMessage).not.toHaveBeenCalled();
    checkMessage();
    fireEvent.click(
      screen.getByRole("button", { name: "Verificar novamente" }),
    );
    await waitFor(() =>
      expect(window.turnstile?.render).toHaveBeenCalledTimes(2),
    );
    checkMessage();
  });
  it("keeps text after verification or network failure", async () => {
    await openAndFill();
    act(() => widget["error-callback"]());
    checkMessage();
    expect(screen.getByRole("status").textContent).toContain("indisponível");
    vi.mocked(sendContactMessage).mockRejectedValueOnce(
      new Error("Contato temporariamente indisponível."),
    );
    act(() => widget.callback("token"));
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    await screen.findByRole("alert");
    checkMessage();
  });
});

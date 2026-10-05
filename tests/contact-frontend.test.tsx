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
import useMediaQuery from "../src/hooks/use-media-query";
import { sendContactMessage } from "../src/utils/contact-service";

vi.mock("../src/utils/contact-service", () => ({
  sendContactMessage: vi.fn(),
}));
vi.mock("../src/hooks/use-media-query", () => ({
  default: vi.fn(() => false),
}));

type WidgetOptions = Parameters<NonNullable<Window["turnstile"]>["render"]>[1];
let widget: WidgetOptions;
beforeEach(() => {
  vi.mocked(useMediaQuery).mockReturnValue(false);
  vi.spyOn(console, "error").mockImplementation(() => {});
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
  vi.restoreAllMocks();
  delete window.turnstile;
});
function openAndFill() {
  render(<ContactChat />);
  fireEvent.click(screen.getByRole("button", { name: "Abrir conversa" }));
  fireEvent.change(screen.getByLabelText("Seu e-mail"), {
    target: { value: "visitor@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Mensagem"), {
    target: { value: "My message to preserve" },
  });
}
async function submit() {
  fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
  await waitFor(() => expect(window.turnstile?.render).toHaveBeenCalled());
}
function checkMessage() {
  expect((screen.getByLabelText("Mensagem") as HTMLTextAreaElement).value).toBe(
    "My message to preserve",
  );
  expect((screen.getByLabelText("Seu e-mail") as HTMLInputElement).value).toBe(
    "visitor@example.com",
  );
}

describe("contact submission UX", () => {
  it("blocks malformed public keys without loading or exposing their value", async () => {
    const invalidKey = `0x4${"A".repeat(32)}`;
    vi.stubEnv("VITE_TURNSTILE_SITE_KEY", invalidKey);
    openAndFill();
    expect(screen.queryByRole("alert")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Tente mais tarde",
    );
    expect(window.turnstile?.render).not.toHaveBeenCalled();
    expect(sendContactMessage).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith("[Contact verification]", {
      code: "invalid_sitekey_format",
      hostname: window.location.hostname,
    });
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain(
      invalidKey,
    );
    checkMessage();
  });
  it("distinguishes a Cloudflare configuration rejection from a retryable challenge failure", async () => {
    openAndFill();
    await submit();
    act(() => widget["error-callback"]("400020"));
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Tente mais tarde",
    );
    expect(sendContactMessage).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith("[Contact verification]", {
      code: "400020",
      hostname: window.location.hostname,
    });
    checkMessage();
  });
  it("opens a clean modal desktop chat without loading verification", () => {
    openAndFill();
    expect(window.turnstile?.render).not.toHaveBeenCalled();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(
      screen.queryByText(/Verificar novamente|Verificação indisponível/),
    ).toBeNull();
    expect(screen.getByRole("dialog").getAttribute("aria-modal")).toBe("true");
    expect(
      screen.getAllByRole("button", { name: "Fechar conversa" }),
    ).toHaveLength(3);
  });
  it("verifies on submit and sends automatically once verified", async () => {
    vi.mocked(sendContactMessage).mockResolvedValue(undefined);
    openAndFill();
    await submit();
    expect(widget.appearance).toBe("interaction-only");
    expect(widget["feedback-enabled"]).toBe(false);
    expect(sendContactMessage).not.toHaveBeenCalled();
    expect(
      (
        screen.getByRole("button", {
          name: "Verificando...",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    act(() => widget.callback("first-token"));
    await screen.findByText(/Recebi sua mensagem/);
    expect(sendContactMessage).toHaveBeenCalledExactlyOnceWith({
      name: undefined,
      email: "visitor@example.com",
      message: "My message to preserve",
      turnstileToken: "first-token",
    });
  });
  it("shows a missing-key error only after an attempted submission", async () => {
    vi.stubEnv("VITE_TURNSTILE_SITE_KEY", "");
    openAndFill();
    expect(screen.queryByRole("alert")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Tente mais tarde",
    );
    expect(window.turnstile?.render).not.toHaveBeenCalled();
    expect(sendContactMessage).not.toHaveBeenCalled();
    checkMessage();
  });
  it("recovers from script-load failure by submitting again", async () => {
    const api = window.turnstile;
    delete window.turnstile;
    openAndFill();
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    await screen.findByRole("alert");
    checkMessage();
    window.turnstile = api;
    vi.mocked(sendContactMessage).mockResolvedValue(undefined);
    await submit();
    act(() => widget.callback("new-token"));
    await screen.findByText(/Recebi sua mensagem/);
  });
  it("preserves the form on rate limit and obtains a fresh token on retry", async () => {
    vi.mocked(sendContactMessage)
      .mockRejectedValueOnce(
        new Error(
          "Limite de tentativas atingido. Tente novamente em 42 segundos.",
        ),
      )
      .mockResolvedValueOnce(undefined);
    openAndFill();
    await submit();
    act(() => widget.callback("first-token"));
    await screen.findByRole("alert");
    checkMessage();
    expect(window.turnstile?.render).toHaveBeenCalledTimes(1);
    await submit();
    await waitFor(() =>
      expect(window.turnstile?.render).toHaveBeenCalledTimes(2),
    );
    act(() => widget.callback("fresh-token"));
    await screen.findByText(/Recebi sua mensagem/);
    expect(sendContactMessage).toHaveBeenLastCalledWith({
      name: undefined,
      email: "visitor@example.com",
      message: "My message to preserve",
      turnstileToken: "fresh-token",
    });
  });
  it.each([
    "expired-callback",
    "error-callback",
    "timeout-callback",
    "unsupported-callback",
  ] as const)(
    "keeps text and allows a fresh submission after %s",
    async (callback) => {
      openAndFill();
      await submit();
      act(() => {
        if (callback === "error-callback") widget[callback]("300001");
        else widget[callback]();
      });
      await screen.findByRole("alert");
      expect(sendContactMessage).not.toHaveBeenCalled();
      checkMessage();
      await submit();
      await waitFor(() =>
        expect(window.turnstile?.render).toHaveBeenCalledTimes(2),
      );
      checkMessage();
    },
  );
  it("cancels pending verification when closed and ignores its late callback", async () => {
    openAndFill();
    await submit();
    const previousWidget = widget;
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => expect(window.turnstile?.remove).toHaveBeenCalled());
    act(() => previousWidget.callback("late-token"));
    expect(sendContactMessage).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Abrir conversa" }));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Enviar mensagem" }),
    ).toBeDefined();
  });
});

describe.each([false, true])(
  "contact modal (small screen: %s)",
  (smallScreen) => {
    beforeEach(() => vi.mocked(useMediaQuery).mockReturnValue(smallScreen));

    function setupModal() {
      const view = render(
        <div id="root">
          <button type="button">Background action</button>
          <ContactChat />
        </div>,
      );
      const page = document.getElementById("root")!;
      const launcher = screen.getByRole("button", { name: "Abrir conversa" });
      launcher.focus();
      fireEvent.click(launcher);
      return { ...view, page, launcher };
    }

    it.each(["backdrop", "close", "launcher", "escape"])(
      "blurs and disables the page, then restores it via %s",
      async (method) => {
        const bodyOverflow = document.body.style.overflow;
        const rootOverflow = document.documentElement.style.overflow;
        const gutter = document.documentElement.style.scrollbarGutter;
        const { page, launcher } = setupModal();
        expect(page.inert).toBe(true);
        expect(document.body.style.overflow).toBe("hidden");
        expect(document.documentElement.style.overflow).toBe("hidden");
        expect(screen.getByRole("dialog").getAttribute("aria-modal")).toBe(
          "true",
        );
        const backdrop = document.querySelector<HTMLButtonElement>(
          "button[data-cursor-ignore]",
        )!;
        expect(backdrop.className).toContain("backdrop-blur-[2px]");
        expect(backdrop.className).toContain("pointer-events-auto");
        expect(backdrop.tabIndex).toBe(-1);
        if (method === "escape") fireEvent.keyDown(window, { key: "Escape" });
        else if (method === "backdrop") fireEvent.click(backdrop);
        else if (method === "launcher") fireEvent.click(launcher);
        else
          fireEvent.click(screen.getByRole("dialog").querySelector("button")!);
        await waitFor(() => expect(page.inert).toBe(false));
        expect(document.body.style.overflow).toBe(bodyOverflow);
        expect(document.documentElement.style.overflow).toBe(rootOverflow);
        expect(document.documentElement.style.scrollbarGutter).toBe(gutter);
        expect(document.activeElement).toBe(launcher);
      },
    );

    it("contains keyboard focus and restores existing page state on unmount", async () => {
      const { page, unmount } = setupModal();
      const dialog = screen.getByRole("dialog");
      await waitFor(() =>
        expect(document.activeElement).toBe(screen.getByLabelText(/Nome/)),
      );
      const first = dialog.querySelector("button")!;
      const last = screen.getByRole("button", { name: "Enviar mensagem" });
      first.focus();
      fireEvent.keyDown(first, { key: "Tab", shiftKey: true });
      expect(document.activeElement).toBe(last);
      fireEvent.keyDown(last, { key: "Tab" });
      expect(document.activeElement).toBe(first);
      page.querySelector("button")!.focus();
      expect(dialog.contains(document.activeElement)).toBe(true);
      unmount();
      expect(page.inert).toBe(false);
      expect(document.body.style.overflow).not.toBe("hidden");
      expect(document.documentElement.style.overflow).not.toBe("hidden");
    });
  },
);

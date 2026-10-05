import { useEffect, useRef } from "react";

type Turnstile = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      size: string;
      appearance: "interaction-only";
      retry: "never";
      "refresh-expired": "never";
      "refresh-timeout": "never";
      "feedback-enabled": boolean;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": (code: string) => boolean;
      "timeout-callback": () => void;
      "unsupported-callback": () => void;
    },
  ) => string;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

let loading: Promise<Turnstile> | undefined;
function loadTurnstile(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (loading) return loading;
  loading = new Promise<Turnstile>((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    const timer = window.setTimeout(() => fail(), 12_000);
    const fail = () => {
      window.clearTimeout(timer);
      script.remove();
      reject(new Error("Verification unavailable"));
    };
    script.onerror = fail;
    script.onload = () => {
      window.clearTimeout(timer);
      if (window.turnstile) resolve(window.turnstile);
      else fail();
    };
    document.head.append(script);
  }).catch((error: unknown) => {
    loading = undefined;
    throw error;
  });
  return loading;
}

const VERIFICATION_ERROR =
  "Não foi possível confirmar o envio. Tente enviar novamente. Sua mensagem foi preservada.";
const CONFIGURATION_ERRORS = new Set([
  "missing_sitekey",
  "invalid_sitekey_format",
  "110100",
  "110110",
  "110200",
  "400020",
  "400021",
  "400070",
]);

export default function ContactVerification({
  onToken,
  onError,
}: {
  onToken: (token: string) => void;
  onError: (error: Error) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    let widget: string | undefined;
    let api: Turnstile | undefined;
    const fail = (code: string) => {
      if (cancelled) return;
      // Never log keys or tokens; diagnostics belong in the developer console.
      console.error("[Contact verification]", {
        code,
        hostname: window.location.hostname,
      });
      onError(
        new Error(
          CONFIGURATION_ERRORS.has(code)
            ? "Contato temporariamente indisponível. Sua mensagem foi preservada. Tente mais tarde."
            : VERIFICATION_ERROR,
        ),
      );
    };
    const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();
    if (!sitekey) {
      fail("missing_sitekey");
      return;
    }
    // Cloudflare's widget API defines sitekey with maxLength: 32.
    if (sitekey.length > 32 || /\s/.test(sitekey)) {
      fail("invalid_sitekey_format");
      return;
    }
    loadTurnstile()
      .then((loaded) => {
        if (cancelled || !container.current) return;
        api = loaded;
        widget = loaded.render(container.current, {
          sitekey,
          action: "contact",
          size: "flexible",
          appearance: "interaction-only",
          retry: "never",
          "refresh-expired": "never",
          "refresh-timeout": "never",
          "feedback-enabled": false,
          callback: (token) => {
            if (!cancelled) onToken(token);
          },
          "expired-callback": () => fail("token_expired"),
          "error-callback": (code) => {
            fail(code);
            // Acknowledge handling so Turnstile does not log the same failure again.
            return true;
          },
          "timeout-callback": () => fail("challenge_timeout"),
          "unsupported-callback": () => fail("unsupported_browser"),
        });
      })
      .catch(() => fail("widget_load_failed"));
    return () => {
      cancelled = true;
      if (widget !== undefined) api?.remove(widget);
    };
  }, [onToken, onError]);
  return <div ref={container} data-cursor-native />;
}

import { useEffect, useRef, useState } from "react";

type Turnstile = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      size: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
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

function VerificationWidget({ onToken }: { onToken: (token: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const [notice, setNotice] = useState("Carregando verificação...");
  useEffect(() => {
    let cancelled = false;
    let widget: string | undefined;
    let api: Turnstile | undefined;
    onToken("");
    const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (!sitekey) {
      setNotice("Verificação indisponível. Tente novamente mais tarde.");
      return;
    }
    setNotice("Carregando verificação...");
    loadTurnstile()
      .then((loaded) => {
        if (cancelled || !container.current) return;
        api = loaded;
        widget = loaded.render(container.current, {
          sitekey,
          action: "contact",
          size: "flexible",
          callback: (token) => {
            if (!cancelled) {
              onToken(token);
              setNotice("");
            }
          },
          "expired-callback": () => {
            if (!cancelled) {
              onToken("");
              setNotice(
                "Verificação expirada. Verifique novamente para enviar.",
              );
            }
          },
          "error-callback": () => {
            if (!cancelled) {
              onToken("");
              setNotice("Verificação indisponível. Tente verificar novamente.");
            }
          },
        });
        setNotice("");
      })
      .catch(() => {
        if (!cancelled) {
          onToken("");
          setNotice("Verificação indisponível. Tente verificar novamente.");
        }
      });
    return () => {
      cancelled = true;
      if (widget !== undefined) api?.remove(widget);
    };
  }, [onToken]);
  return (
    <div className="grid gap-2">
      <div ref={container} />
      <p role="status" className="text-sm opacity-70">
        {notice}
      </p>
    </div>
  );
}

export default function ContactVerification({
  onToken,
}: {
  onToken: (token: string) => void;
}) {
  const [attempt, setAttempt] = useState(0);
  return (
    <div className="grid gap-2">
      <VerificationWidget key={attempt} onToken={onToken} />
      <button
        type="button"
        className="text-left text-sm underline underline-offset-4"
        onClick={() => setAttempt((value) => value + 1)}
      >
        Verificar novamente
      </button>
    </div>
  );
}

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import ChatIcon from "../assets/icons/chat.svg?react";
import PaperPlaneIcon from "../assets/icons/paper-plane-tilt.svg?react";
import XIcon from "../assets/icons/x.svg?react";
import Button from "../components/button";
import Icon from "../components/icon";
import { sendContactMessage } from "../utils/contact-service";

export const OPEN_CONTACT_CHAT_EVENT = "portfolio:open-contact-chat";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactChat() {
  const titleId = useId();
  const panelId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const openChat = () => setIsOpen(true);
    window.addEventListener(OPEN_CONTACT_CHAT_EVENT, openChat);
    return () => window.removeEventListener(OPEN_CONTACT_CHAT_EVENT, openChat);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    const focusTimer = window.setTimeout(
      () => panelRef.current?.querySelector<HTMLInputElement>("input")?.focus(),
      prefersReducedMotion ? 0 : 180,
    );
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen, prefersReducedMotion]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setStatus("sending");
    setError("");
    try {
      await sendContactMessage({
        name: String(form.get("name") ?? "").trim() || undefined,
        email: String(form.get("email") ?? "").trim(),
        message: String(form.get("message") ?? "").trim(),
      });
      setStatus("sent");
      formElement.reset();
    } catch (caughtError) {
      setStatus("error");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível enviar sua mensagem. Tente novamente.",
      );
    }
  };

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-[80]"
      data-native-scroll
    >
      <AnimatePresence>
        {isOpen && (
          <motion.button
            type="button"
            aria-label="Fechar conversa"
            data-cursor-ignore
            className="pointer-events-auto absolute inset-0 cursor-default bg-black/35 backdrop-blur-[2px] sm:bg-black/10 sm:backdrop-blur-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="absolute inset-x-3 bottom-3 flex flex-col items-end sm:inset-x-auto sm:right-6 sm:bottom-6">
        <AnimatePresence>
          {isOpen && (
            <motion.section
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="pointer-events-auto mb-3 flex max-h-[calc(100dvh-6.75rem)] w-full flex-col overflow-hidden rounded-2xl border border-chat-border bg-chat-surface shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:mb-4 sm:w-[min(390px,calc(100vw-3rem))]"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.24,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <header className="flex items-start justify-between border-b border-chat-border bg-chat-surface-muted px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="relative flex h-2.5 w-2.5"
                      aria-hidden="true"
                    >
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-online opacity-35 motion-reduce:animate-none" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-status-online" />
                    </span>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-status-online">
                      Online
                    </p>
                  </div>
                  <h2
                    id={titleId}
                    className="mt-1.5 text-xl font-medium tracking-wide"
                  >
                    Fale comigo
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 opacity-60 transition hover:bg-current/10 hover:opacity-100"
                  aria-label="Fechar conversa"
                  data-cursor-clickable
                >
                  <Icon svg={XIcon} size="sm" className="fill-current" />
                </button>
              </header>

              <div className="overflow-y-auto p-5" data-native-scroll>
                <div className="mb-5 max-w-[88%] rounded-2xl rounded-tl-sm bg-chat-surface-muted px-4 py-3 text-sm leading-relaxed opacity-90">
                  Olá! Conte um pouco sobre o que você tem em mente. Vou
                  responder diretamente no seu e-mail.
                </div>

                {status === "sent" ? (
                  <div className="rounded-xl border border-status-online/35 bg-status-online/10 p-4 text-sm leading-relaxed">
                    Mensagem recebida. Obrigado pelo contato — retorno pelo
                    e-mail informado assim que possível.
                    <button
                      type="button"
                      className="mt-3 block font-medium underline underline-offset-4"
                      onClick={() => setStatus("idle")}
                      data-cursor-clickable
                    >
                      Enviar outra mensagem
                    </button>
                  </div>
                ) : (
                  <form className="grid gap-3.5" onSubmit={handleSubmit}>
                    <label className="grid gap-1.5 text-sm">
                      <span className="opacity-70">
                        Nome <span className="opacity-50">(opcional)</span>
                      </span>
                      <input
                        name="name"
                        autoComplete="name"
                        maxLength={100}
                        className="rounded-lg border border-chat-border bg-chat-input px-3 py-2.5 outline-none transition focus:border-icon-primary/70 focus:ring-2 focus:ring-icon-primary/15"
                      />
                    </label>
                    <label className="grid gap-1.5 text-sm">
                      <span className="opacity-70">Seu e-mail</span>
                      <input
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        maxLength={254}
                        className="rounded-lg border border-chat-border bg-chat-input px-3 py-2.5 outline-none transition focus:border-icon-primary/70 focus:ring-2 focus:ring-icon-primary/15"
                      />
                    </label>
                    <label className="grid gap-1.5 text-sm">
                      <span className="opacity-70">Mensagem</span>
                      <textarea
                        name="message"
                        required
                        maxLength={3000}
                        rows={4}
                        className="resize-none rounded-lg border border-chat-border bg-chat-input px-3 py-2.5 outline-none transition focus:border-icon-primary/70 focus:ring-2 focus:ring-icon-primary/15"
                      />
                    </label>
                    {status === "error" && (
                      <p
                        className="text-sm text-red-700 dark:text-red-300"
                        role="alert"
                      >
                        {error}
                      </p>
                    )}
                    <Button
                      type="submit"
                      icon={PaperPlaneIcon}
                      className="mt-1 w-full disabled:cursor-wait disabled:opacity-60"
                      disabled={status === "sending"}
                    >
                      {status === "sending" ? "Enviando..." : "Enviar mensagem"}
                    </Button>
                  </form>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          className="pointer-events-auto relative flex h-13 w-13 items-center justify-center rounded-full border border-chat-border bg-chat-launcher text-chat-launcher-content shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-colors hover:bg-chat-launcher-hover sm:h-14 sm:w-14"
          onClick={() => setIsOpen((current) => !current)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={panelId}
          aria-label={isOpen ? "Fechar conversa" : "Abrir conversa"}
          data-cursor-clickable
          whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
        >
          <span className="flex h-8 w-8 items-center justify-center">
            <Icon
              svg={isOpen ? XIcon : ChatIcon}
              size="md"
              className="fill-current"
            />
            {!isOpen && (
              <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full border-2 border-chat-launcher bg-status-online" />
            )}
          </span>
        </motion.button>
      </div>
    </div>,
    document.body,
  );
}

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import ChatIcon from "../assets/icons/chat.svg?react";
import PaperPlaneIcon from "../assets/icons/paper-plane-tilt.svg?react";
import XIcon from "../assets/icons/x.svg?react";
import Button from "../components/button";
import Icon from "../components/icon";
import ContactVerification from "../components/contact-verification";
import useMediaQuery from "../hooks/use-media-query";
import { sendContactMessage } from "../utils/contact-service";

export const OPEN_CONTACT_CHAT_EVENT = "portfolio:open-contact-chat";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactChat() {
  const titleId = useId();
  const panelId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isSmallScreen = useMediaQuery("(max-width: 639px)");
  const [isOpen, setIsOpen] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [isDockVisible, setIsDockVisible] = useState(false);
  const [dockTarget, setDockTarget] = useState<HTMLElement | null>(null);
  const [isDockExpanded, setIsDockExpanded] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [verificationAttempt, setVerificationAttempt] = useState(0);

  useEffect(() => {
    const openChat = () => setIsOpen(true);
    window.addEventListener(OPEN_CONTACT_CHAT_EVENT, openChat);
    return () => window.removeEventListener(OPEN_CONTACT_CHAT_EVENT, openChat);
  }, []);

  useEffect(() => {
    const footer = document.getElementById("contact");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsFooterVisible(entry.isIntersecting),
      { threshold: 0.12 },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const dock = document.getElementById("contact-chat-dock");
    if (!dock) return;

    setDockTarget(dock);
    const observer = new IntersectionObserver(
      ([entry]) => setIsDockVisible(entry.isIntersecting),
      { threshold: 0.25 },
    );
    observer.observe(dock);
    return () => observer.disconnect();
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
    if (status === "sending") return;
    if (!turnstileToken) {
      setStatus("error");
      setError("Conclua a verificação antes de enviar. Sua mensagem foi preservada.");
      return;
    }
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setStatus("sending");
    setError("");
    try {
      await sendContactMessage({
        turnstileToken,
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
    } finally {
      setTurnstileToken("");
      setVerificationAttempt((value) => value + 1);
    }
  };

  const isDocked = isSmallScreen && isDockVisible && dockTarget !== null;
  const showMobileCta = isDocked && isDockExpanded && !isOpen;
  const showFooterCta =
    !isOpen && (isSmallScreen ? showMobileCta : isFooterVisible);

  useEffect(() => {
    if (!isDocked || isOpen) {
      setIsDockExpanded(false);
      return;
    }

    const timer = window.setTimeout(
      () => setIsDockExpanded(true),
      prefersReducedMotion ? 0 : 420,
    );
    return () => window.clearTimeout(timer);
  }, [isDocked, isOpen, prefersReducedMotion]);

  const launcher = (
    <motion.button
      type="button"
      layoutId={isSmallScreen ? "mobile-contact-launcher" : undefined}
      className={`pointer-events-auto relative flex items-center border border-chat-border bg-chat-launcher text-chat-launcher-content transition-[width,height,padding,border-radius,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-chat-launcher-hover ${
        showMobileCta
          ? "h-20 w-[min(22rem,calc(100vw-3rem))] justify-between gap-3 rounded-2xl px-4 shadow-[0_18px_55px_rgba(0,0,0,0.24)]"
          : showFooterCta
            ? "h-13 w-48 justify-start gap-3 rounded-full px-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] sm:h-14"
            : "h-13 w-13 justify-center rounded-full px-0 shadow-[0_10px_30px_rgba(0,0,0,0.18)] sm:h-14 sm:w-14"
      }`}
      onClick={() => setIsOpen((current) => !current)}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls={panelId}
      aria-label={isOpen ? "Fechar conversa" : "Abrir conversa"}
      data-cursor-clickable
      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
      transition={{
        layout: {
          duration: prefersReducedMotion ? 0 : 0.42,
          ease: [0.22, 1, 0.36, 1],
        },
      }}
    >
      <span
        className={`flex shrink-0 items-center justify-center transition-[width,height,border-radius,background-color] duration-300 ${
          showMobileCta
            ? "h-11 w-11 rounded-xl bg-white/10 dark:bg-black/10"
            : "h-8 w-8"
        }`}
      >
        <Icon
          svg={isOpen ? XIcon : ChatIcon}
          size="md"
          className="fill-current"
        />
        {!isOpen && !showMobileCta && (
          <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full border-2 border-chat-launcher bg-status-online" />
        )}
      </span>
      <AnimatePresence initial={false}>
        {showFooterCta && (
          <motion.span
            className={`min-w-0 flex-1 whitespace-nowrap text-left ${
              showMobileCta ? "flex flex-col" : "text-sm font-medium"
            }`}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
          >
            {showMobileCta ? (
              <>
                <span className="text-base font-semibold tracking-wide">
                  Vamos conversar
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-xs font-normal opacity-70">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-status-online" />
                  Online · resposta por e-mail
                </span>
              </>
            ) : (
              "Entre em contato"
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );

  const overlay = createPortal(
    <div className="pointer-events-none fixed inset-0 z-[80]" data-native-scroll>
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
                    <ContactVerification key={verificationAttempt} onToken={setTurnstileToken} />
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

        <AnimatePresence>
          {!isDocked && (
            <motion.div
              key="fixed-contact-launcher"
            >
              {launcher}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>,
    document.body,
  );

  const dockedLauncher =
    isDocked && !isOpen && dockTarget
      ? createPortal(
          <motion.div
            key="docked-contact-launcher"
            className="flex h-full w-full items-center justify-end"
          >
            {launcher}
          </motion.div>,
          dockTarget,
        )
      : null;

  return (
    <LayoutGroup id="contact-launcher">
      {overlay}
      {dockedLauncher}
    </LayoutGroup>
  );
}

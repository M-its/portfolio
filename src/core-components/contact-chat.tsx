import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import ChatIcon from "../assets/icons/chat.svg?react";
import PaperPlaneIcon from "../assets/icons/paper-plane-tilt.svg?react";
import XIcon from "../assets/icons/x.svg?react";
import Icon from "../components/icon";
import ContactVerification from "../components/contact-verification";
import useMediaQuery from "../hooks/use-media-query";
import { sendContactMessage } from "../utils/contact-service";
import {
  MOBILE_MENU_STATE_EVENT,
  type MobileMenuStateDetail,
} from "../utils/ui-events";

export const OPEN_CONTACT_CHAT_EVENT = "portfolio:open-contact-chat";

type Status = "idle" | "sending" | "sent" | "error";
type LauncherPhase = "compact" | "vertical" | "expanded";

const MOTION_EASE = [0.22, 1, 0.36, 1] as const;
const PHASE_DURATION: Record<LauncherPhase, number> = {
  compact: 0.36,
  vertical: 0.32,
  expanded: 0.56,
};
const SIGNAL_WIDTHS = [8, 13, 6];
const REDUCED_DURATION = 0.1;

function FormField({
  label,
  fieldId,
  optional = false,
  children,
}: {
  label: string;
  fieldId: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <label htmlFor={fieldId} className="grid gap-1 px-4 py-3 transition-colors focus-within:bg-chat-surface-muted/45">
      <span className="text-[10px] font-medium uppercase tracking-[0.18em] opacity-50">
        {label}
        {optional && (
          <span className="normal-case tracking-normal"> (opcional)</span>
        )}
      </span>
      {children}
    </label>
  );
}

export default function ContactChat() {
  const titleId = useId();
  const panelId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isSmallScreen = useMediaQuery("(max-width: 639px)");
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const dockY = useMotionValue(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [isDocked, setIsDocked] = useState(false);
  const [launcherPhase, setLauncherPhase] = useState<LauncherPhase>("compact");
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
    const syncViewportWidth = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", syncViewportWidth);
    return () => window.removeEventListener("resize", syncViewportWidth);
  }, []);

  useEffect(() => {
    const handleMobileMenuState = (event: Event) => {
      const { open } = (event as CustomEvent<MobileMenuStateDetail>).detail;
      setIsMobileMenuOpen(open);
      if (open) setIsOpen(false);
    };

    window.addEventListener(MOBILE_MENU_STATE_EVENT, handleMobileMenuState);
    return () =>
      window.removeEventListener(
        MOBILE_MENU_STATE_EVENT,
        handleMobileMenuState,
      );
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

    let animationFrame = 0;
    let dockBottom = 0;
    let positionAnimation: ReturnType<typeof animate> | null = null;

    const measureDock = () => {
      const rect = dock.getBoundingClientRect();
      dockBottom = rect.bottom + window.scrollY;
    };

    const updateDockPosition = (animatePosition = false) => {
      animationFrame = 0;

      if (!isSmallScreen) {
        dockY.set(0);
        setIsDocked(false);
        return;
      }

      const fixedBottom = window.innerHeight - 12;
      const dockBottomInViewport = dockBottom - window.scrollY;
      const shouldDock = dockBottomInViewport <= fixedBottom;
      const targetY =
        isOpen || !shouldDock ? 0 : dockBottomInViewport - fixedBottom;

      positionAnimation?.stop();
      positionAnimation = null;
      if (animatePosition && !prefersReducedMotion) {
        positionAnimation = animate(dockY, targetY, {
          duration: 0.34,
          ease: MOTION_EASE,
        });
      } else {
        dockY.set(targetY);
      }

      setIsDocked((current) => (current === shouldDock ? current : shouldDock));
    };

    const scheduleUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(() =>
        updateDockPosition(false),
      );
    };

    const measureAndUpdate = () => {
      measureDock();
      scheduleUpdate();
    };

    measureDock();
    updateDockPosition(true);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", measureAndUpdate);
    window.addEventListener("load", measureAndUpdate);

    const resizeObserver = new ResizeObserver(measureAndUpdate);
    resizeObserver.observe(document.body);

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      positionAnimation?.stop();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", measureAndUpdate);
      window.removeEventListener("load", measureAndUpdate);
    };
  }, [dockY, isOpen, isSmallScreen, prefersReducedMotion]);

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

  const showMobileCta = isDocked && launcherPhase === "expanded" && !isOpen;
  const showVerticalLauncher =
    isDocked && launcherPhase === "vertical" && !isOpen;
  const showFooterCta =
    !isOpen && (isSmallScreen ? showMobileCta : isFooterVisible);
  const showStatusDot = !isOpen && (!isSmallScreen || !showMobileCta);
  const launcherWidth = isSmallScreen
    ? Math.max(56, Math.min(352, viewportWidth - 48))
    : 208;
  const launcherHeight = isSmallScreen ? 80 : 48;
  const visibleWidth = showFooterCta
    ? launcherWidth
    : showVerticalLauncher
      ? 48
      : 56;
  const visibleHeight =
    isSmallScreen && (showFooterCta || showVerticalLauncher) ? 80 : 56;
  const visibleTop = launcherHeight - visibleHeight;
  const visibleLeft = launcherWidth - visibleWidth;
  const visibleRadius = showMobileCta ? 10 : showVerticalLauncher ? 7 : 28;
  const shapeDuration = prefersReducedMotion
    ? REDUCED_DURATION
    : isSmallScreen
      ? PHASE_DURATION[launcherPhase]
      : 0.3;
  const shapeTransition = {
    duration: shapeDuration,
    ease: MOTION_EASE,
  };
  const transition = (duration: number, delay = 0) => ({
    duration: prefersReducedMotion ? REDUCED_DURATION : duration,
    delay: prefersReducedMotion ? 0 : delay,
    ease: MOTION_EASE,
  });
  const iconOffsetX = showFooterCta ? 66 - launcherWidth : 0;
  const compactDotY = visibleTop + 8;

  useEffect(() => {
    if (!isDocked || isOpen) {
      setLauncherPhase("compact");
      return;
    }

    if (prefersReducedMotion) {
      setLauncherPhase("expanded");
      return;
    }

    setLauncherPhase("vertical");
    const expandTimer = window.setTimeout(
      () => setLauncherPhase("expanded"),
      300,
    );
    return () => window.clearTimeout(expandTimer);
  }, [isDocked, isOpen, prefersReducedMotion]);

  const launcher = (
    <div className="relative">
      <motion.button
        type="button"
        className="group pointer-events-auto relative block origin-bottom-right overflow-visible text-chat-launcher-content"
        style={{ width: launcherWidth, height: launcherHeight }}
        animate={{
          clipPath: `inset(${visibleTop}px 0px 0px ${visibleLeft}px round ${visibleRadius}px)`,
        }}
        transition={{ clipPath: shapeTransition }}
        onClick={() => setIsOpen((current) => !current)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? "Fechar conversa" : "Abrir conversa"}
        data-cursor-clickable
        tabIndex={isMobileMenuOpen ? -1 : 0}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
      >
        <svg
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 overflow-visible transition-[filter] duration-300 ${
            showMobileCta
              ? "drop-shadow-[0_18px_28px_rgba(0,0,0,0.2)]"
              : showVerticalLauncher
                ? "drop-shadow-[0_14px_22px_rgba(0,0,0,0.18)]"
                : "drop-shadow-[0_9px_16px_rgba(0,0,0,0.16)]"
          }`}
          width={launcherWidth}
          height={launcherHeight}
          viewBox={`0 0 ${launcherWidth} ${launcherHeight}`}
        >
          <motion.rect
            className="fill-chat-launcher stroke-chat-border transition-colors duration-300 group-hover:fill-chat-launcher-hover"
            vectorEffect="non-scaling-stroke"
            strokeWidth="1"
            initial={{
              x: visibleLeft + 0.5,
              y: visibleTop + 0.5,
              width: visibleWidth - 1,
              height: visibleHeight - 1,
              rx: visibleRadius,
            }}
            animate={{
              x: visibleLeft + 0.5,
              y: visibleTop + 0.5,
              width: visibleWidth - 1,
              height: visibleHeight - 1,
              rx: visibleRadius,
            }}
            transition={shapeTransition}
          />
        </svg>
        <span className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center">
          <motion.span
            className={`relative flex h-11 w-11 items-center justify-center rounded-lg transition-colors duration-300 ${
              showMobileCta ? "bg-white/10 dark:bg-black/10" : "bg-transparent"
            }`}
            animate={{ x: iconOffsetX, y: visibleTop / 2 }}
            transition={shapeTransition}
          >
            <motion.span
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                opacity: isOpen || showVerticalLauncher ? 0 : 1,
                rotate: isOpen ? -20 : showVerticalLauncher ? -8 : 0,
              }}
              transition={transition(0.22)}
            >
              <Icon svg={ChatIcon} size="md" className="fill-current" />
            </motion.span>
            <motion.span
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                opacity: isOpen ? 1 : 0,
                rotate: isOpen ? 0 : 20,
              }}
              transition={transition(0.22)}
            >
              <Icon svg={XIcon} size="md" className="fill-current" />
            </motion.span>
          </motion.span>
        </span>
        <span className="pointer-events-none absolute right-[20px] top-1/2 flex -translate-y-1/2 flex-col items-center gap-1">
          {SIGNAL_WIDTHS.map((width, index) => (
            <motion.span
              key={width}
              className="block h-px origin-right bg-current"
              style={{ width }}
              animate={{
                opacity: showVerticalLauncher ? 0.7 : 0,
                scaleX: showVerticalLauncher ? 1 : 0.25,
                x: showVerticalLauncher ? 0 : 4,
              }}
              transition={transition(
                0.2,
                showVerticalLauncher ? index * 0.055 : 0,
              )}
            />
          ))}
        </span>
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 top-3 left-[3.65rem] w-px bg-current/20"
          animate={{
            opacity: showFooterCta ? 1 : 0,
            scaleY: showFooterCta ? 1 : 0.3,
          }}
          transition={transition(0.3, showMobileCta ? 0.12 : 0)}
        />
        <span
          aria-hidden={!showFooterCta}
          className="pointer-events-none absolute inset-y-0 left-[4.5rem] right-4 flex min-w-0 items-center overflow-hidden whitespace-nowrap text-left sm:left-16"
        >
          <motion.span
            className="relative flex h-full min-w-0 flex-col justify-center"
            animate={{
              opacity: showFooterCta ? 1 : 0,
              x: showFooterCta ? 0 : 12,
            }}
            transition={transition(
              showMobileCta ? 0.32 : 0.2,
              showMobileCta ? 0.18 : 0,
            )}
          >
            <motion.span
              className="truncate text-base font-semibold leading-none tracking-wide sm:text-sm sm:font-medium sm:tracking-normal"
              animate={{ y: showMobileCta ? -10 : -4 }}
              transition={transition(0.28)}
            >
              Vamos conversar
            </motion.span>
            <motion.span
              className="absolute left-0 top-1/2 flex items-center gap-1.5 overflow-hidden pt-1 text-xs font-normal opacity-70"
              animate={{
                opacity: showMobileCta ? 0.7 : 0,
                x: showMobileCta ? 0 : 12,
              }}
              transition={transition(0.28, showMobileCta ? 0.24 : 0)}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-status-online" />
              Online · resposta por e-mail
            </motion.span>
          </motion.span>
        </span>
      </motion.button>
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full bg-status-online"
        animate={{
          opacity: showStatusDot ? 1 : 0,
          x: -8,
          y: showVerticalLauncher || showFooterCta ? 0 : compactDotY,
        }}
        transition={transition(0.28)}
      />
    </div>
  );

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[80]">
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
              className="pointer-events-auto mb-3 flex max-h-[calc(100dvh-6.75rem)] w-full flex-col overflow-hidden rounded-[1.25rem] border border-chat-border bg-chat-surface shadow-[0_24px_64px_-24px_rgba(0,0,0,0.34)] sm:mb-4 sm:w-[min(410px,calc(100vw-3rem))]"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.24,
                ease: MOTION_EASE,
              }}
            >
              <header className="px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-medium uppercase tracking-[0.24em] opacity-50">
                    Contato
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full bg-status-online"
                      aria-hidden="true"
                    />
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-status-online">
                      Disponível agora
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-start justify-between gap-4">
                  <h2
                    id={titleId}
                    className="text-[1.7rem] leading-[1.08] font-light tracking-[-0.025em]"
                  >
                    Tem uma ideia
                    <span className="block font-medium">em mente?</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-chat-border opacity-65 transition hover:rotate-6 hover:bg-chat-surface-muted hover:opacity-100"
                    aria-label="Fechar conversa"
                    data-cursor-clickable
                  >
                    <Icon svg={XIcon} size="sm" className="fill-current" />
                  </button>
                </div>
                <p className="mt-3 max-w-[31rem] text-sm leading-relaxed opacity-60">
                  Conte o que você quer construir. Eu leio pessoalmente e
                  respondo direto no seu e-mail.
                </p>
              </header>

              <div
                className="overflow-y-auto px-5 pt-1 pb-5 sm:px-6 sm:pb-6"
                data-native-scroll
              >
                {status === "sent" ? (
                  <div className="border-l-2 border-status-online bg-status-online/8 px-4 py-3 text-sm leading-relaxed">
                    Recebi sua mensagem! Obrigado por entrar em contato. Em breve, responderei pelo e-mail informado
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
                  <form className="grid gap-4" onSubmit={handleSubmit}>
                    <div className="divide-y divide-chat-border overflow-hidden rounded-xl border border-chat-border bg-chat-input">
                      <FormField label="Nome" fieldId={`${panelId}-name`} optional>
                        <input
                          id={`${panelId}-name`}
                          name="name"
                          autoComplete="name"
                          maxLength={100}
                          className="bg-transparent py-1 text-sm outline-none placeholder:opacity-35"
                          placeholder="Como posso chamar você?"
                        />
                      </FormField>
                      <FormField label="Seu e-mail" fieldId={`${panelId}-email`}>
                        <input
                          id={`${panelId}-email`}
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          maxLength={254}
                          className="bg-transparent py-1 text-sm outline-none placeholder:opacity-35"
                          placeholder="voce@exemplo.com"
                        />
                      </FormField>
                      <FormField label="Mensagem" fieldId={`${panelId}-message`}>
                        <textarea
                          id={`${panelId}-message`}
                          name="message"
                          required
                          maxLength={3000}
                          rows={3}
                          className="resize-none bg-transparent py-1 text-sm leading-relaxed outline-none placeholder:opacity-35"
                          placeholder="Projeto, ideia ou só um olá..."
                        />
                      </FormField>
                    </div>
                    {status === "error" && (
                      <p
                        className="text-sm text-red-700 dark:text-red-300"
                        role="alert"
                      >
                        {error}
                      </p>
                    )}
                    <ContactVerification key={verificationAttempt} onToken={setTurnstileToken} />
                    <button
                      type="submit"
                      className="group flex w-full items-center justify-between rounded-xl border border-chat-launcher bg-chat-launcher px-3 py-3 text-chat-launcher-content transition duration-300 hover:-translate-y-0.5 hover:bg-chat-launcher-hover hover:shadow-[0_12px_28px_-18px_rgba(0,0,0,0.65)] disabled:cursor-wait disabled:opacity-60"
                      disabled={status === "sending"}
                      data-cursor-clickable
                    >
                      <span className="pl-1 text-sm font-medium tracking-wide">
                        {status === "sending"
                          ? "Enviando..."
                          : "Enviar mensagem"}
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-current/10 transition-transform duration-300 group-hover:-rotate-6 group-hover:translate-x-0.5">
                        <Icon
                          svg={PaperPlaneIcon}
                          size="sm"
                          className="fill-current"
                        />
                      </span>
                    </button>
                    <p className="text-center text-[10px] uppercase tracking-[0.14em] opacity-40">
                      Resposta por e-mail · sem newsletter
                    </p>
                  </form>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <motion.div
          data-contact-launcher-root
          aria-hidden={isMobileMenuOpen}
          className={`relative flex h-20 shrink-0 items-end justify-end transition-opacity duration-200 sm:h-14 ${
            isMobileMenuOpen ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          style={{ y: dockY, width: launcherWidth }}
        >
          {launcher}
        </motion.div>
      </div>
    </div>,
    document.body,
  );
}

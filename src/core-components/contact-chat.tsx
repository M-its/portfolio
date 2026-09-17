import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useState } from "react";

import PaperPlaneIcon from "../assets/icons/paper-plane-tilt.svg?react";
import XIcon from "../assets/icons/x.svg?react";
import Button from "../components/button";
import Icon from "../components/icon";
import { sendContactMessage } from "../utils/contact-service";

type ContactChatProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactChat({ isOpen, onClose }: ContactChatProps) {
  const titleId = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    setError("");

    try {
      await sendContactMessage({
        name: String(form.get("name") ?? "").trim() || undefined,
        email: String(form.get("email") ?? "").trim(),
        message: String(form.get("message") ?? "").trim(),
      });
      setStatus("sent");
      event.currentTarget.reset();
    } catch (caughtError) {
      setStatus("error");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível enviar sua mensagem. Tente novamente.",
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-card-border/50 bg-background shadow-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <header className="flex items-start justify-between border-b border-card-border/40 bg-project-card-surface px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] opacity-50">
                  Novo contato
                </p>
                <h2 id={titleId} className="mt-1 text-xl font-medium tracking-wide">
                  Vamos conversar
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 opacity-60 transition hover:bg-current/10 hover:opacity-100"
                aria-label="Fechar conversa"
              >
                <Icon svg={XIcon} size="sm" className="fill-current" />
              </button>
            </header>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-project-card-surface px-4 py-3 text-sm leading-relaxed opacity-85">
                Olá! Conte um pouco sobre o que você tem em mente. Vou responder
                diretamente no seu e-mail.
              </div>

              {status === "sent" ? (
                <div className="rounded-xl border border-button-secondary-surface/50 bg-button-secondary-surface/15 p-4 text-sm leading-relaxed">
                  Mensagem recebida. Obrigado pelo contato — retorno pelo e-mail
                  informado assim que possível.
                  <button
                    type="button"
                    className="mt-3 block font-medium underline underline-offset-4"
                    onClick={() => setStatus("idle")}
                  >
                    Enviar outra mensagem
                  </button>
                </div>
              ) : (
                <form className="grid gap-4" onSubmit={handleSubmit}>
                  <label className="grid gap-1.5 text-sm">
                    <span className="opacity-70">Nome <span className="opacity-50">(opcional)</span></span>
                    <input
                      name="name"
                      autoComplete="name"
                      maxLength={100}
                      className="rounded-lg border border-card-border/50 bg-transparent px-3 py-2.5 outline-none transition focus:border-icon-primary/70 focus:ring-2 focus:ring-icon-primary/15"
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
                      className="rounded-lg border border-card-border/50 bg-transparent px-3 py-2.5 outline-none transition focus:border-icon-primary/70 focus:ring-2 focus:ring-icon-primary/15"
                    />
                  </label>
                  <label className="grid gap-1.5 text-sm">
                    <span className="opacity-70">Mensagem</span>
                    <textarea
                      name="message"
                      required
                      maxLength={3000}
                      rows={5}
                      className="resize-none rounded-lg border border-card-border/50 bg-transparent px-3 py-2.5 outline-none transition focus:border-icon-primary/70 focus:ring-2 focus:ring-icon-primary/15"
                    />
                  </label>
                  {status === "error" && (
                    <p className="text-sm text-red-600 dark:text-red-300" role="alert">
                      {error}
                    </p>
                  )}
                  <Button
                    type="submit"
                    icon={PaperPlaneIcon}
                    className="mt-1 w-full"
                    disabled={status === "sending"}
                  >
                    {status === "sending" ? "Enviando..." : "Enviar mensagem"}
                  </Button>
                </form>
              )}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

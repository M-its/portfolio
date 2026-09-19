import cx from "classnames";

import ArrowUpIcon from "../assets/icons/arrow-up.svg?react";
import GitHubIcon from "../assets/icons/github.svg?react";
import LinkedInIcon from "../assets/icons/linkedin.svg?react";
import MailIcon from "../assets/icons/mail.svg?react";
import Button from "../components/button";
import Container from "../components/container";
import Divider from "../components/divider";
import Text from "../components/text";
import { OPEN_CONTACT_CHAT_EVENT } from "./contact-chat";

interface FooterProps extends React.ComponentProps<typeof Container> {}

const CONTACT_EMAIL_HREF =
  "mailto:mitsrael9@gmail.com?subject=Oportunidade%20de%20trabalho%20-%20Desenvolvedor%20Full-Stack&body=Olá%20Mitsrael%2C%0A%0AEncontrei%20seu%20portfólio%20e%20gostaria%20de%20conversar%20sobre%20uma%20oportunidade.";

function openContactChat() {
  window.dispatchEvent(new Event(OPEN_CONTACT_CHAT_EVENT));
}

export default function Footer({ className, ...props }: FooterProps) {
  return (
    <Container
      as="footer"
      id="contact"
      className={cx("mt-32 pb-24 sm:mt-40 sm:pb-28", className)}
      {...props}
    >
      <Divider className="bg-gradient-to-r from-transparent via-icon-primary/35 to-transparent" />

      <div className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
        <div className="max-w-2xl">
          <div className="mb-4 flex items-center gap-2 text-sm text-status-online">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-online opacity-35 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-status-online" />
            </span>
            <span className="font-medium tracking-wide">
              Online · disponível para conversar
            </span>
          </div>
          <Text as="h2" variant="heading-section" className="max-w-xl">
            Tem um projeto, uma ideia ou só quer trocar uma ideia?
          </Text>
          <Text variant="paragraph-medium" className="mt-4 max-w-lg opacity-65">
            Me conte brevemente o que você está construindo. Respondo
            diretamente pelo e-mail informado.
          </Text>
        </div>

        <Button
          onClick={openContactChat}
          variant="secondary"
          size="lg"
          icon={MailIcon}
          className="w-full lg:w-auto"
          data-cursor-clickable
        >
          Entre em contato
        </Button>
      </div>

      <Divider className="opacity-35" />

      <div className="flex flex-col gap-7 py-7 sm:flex-row sm:items-center sm:justify-between">
        <Text className="order-3 opacity-55 sm:order-1">
          &copy; {new Date().getFullYear()} — Mitsrael Souza
        </Text>

        <div className="order-1 flex items-center gap-5 sm:order-2 sm:gap-3">
          <Button
            mode="icon"
            size="lg"
            as="a"
            href="https://www.github.com/m-its"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-65 hover:opacity-100"
            aria-label="Visitar meu perfil no GitHub"
            icon={GitHubIcon}
          />
          <Button
            mode="icon"
            size="lg"
            as="a"
            href={CONTACT_EMAIL_HREF}
            aria-label="Enviar um e-mail"
            className="opacity-65 hover:opacity-100"
            icon={MailIcon}
          />
          <Button
            mode="icon"
            size="lg"
            as="a"
            href="https://www.linkedin.com/in/mitsrael-souza-410415162/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visitar meu perfil no LinkedIn"
            className="opacity-65 hover:opacity-100"
            icon={LinkedInIcon}
          />
        </div>

        <Button
          mode="text"
          icon={ArrowUpIcon}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="order-2 opacity-65 hover:opacity-100 sm:order-3"
          data-cursor-clickable
        >
          Voltar ao topo
        </Button>
      </div>
    </Container>
  );
}

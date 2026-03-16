import cx from "classnames";

import Container from "../components/container";
import Text from "../components/text";
import Button from "../components/button";
import Divider from "../components/divider";

import BonfireIcon from "../assets/images/bonfire.svg?react";
import GitHubIcon from "../assets/icons/github.svg?react";
import LinkedInIcon from "../assets/icons/linkedin.svg?react";
import MailIcon from "../assets/icons/mail.svg?react";

interface FooterProps extends React.ComponentProps<typeof Container> {}

export default function Footer({ className, ...props }: FooterProps) {
  return (
    <Container
      as="footer"
      id="contact"
      className={cx(
        "flex flex-col justify-between items-center mt-42",
        className,
      )}
      {...props}
    >
      <Divider
        className="bg-gradient-to-r from-transparent via-btn-primary-bg-hover to-transparent"
        style={{
          maskImage:
            "radial-gradient(circle 60px at center, transparent 50%, black 51%)",
          WebkitMaskImage:
            "radial-gradient(circle 60px at center, transparent 50%, black 51%)",
        }}
      />
      <Button
        mode="icon"
        icon={BonfireIcon}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Voltar ao topo"
        size="xl"
        className="-mt-8 mb-12 md:-mt-10 md:mb-8 hover:scale-[1.1]"
      />

      <div className="flex md:flex-row flex-col justify-center items-center w-full my-6 md:my-12 relative gap-8">
        <Button
          variant="secondary"
          size="lg"
          className="w-full max-w-[440px] md:w-auto md:absolute md:right-0"
        >
          Entre em contato
        </Button>

        <div className="flex gap-6 md:gap-3">
          <Button
            mode="icon"
            size="lg"
            as="a"
            href="https://www.github.com/m-its"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-70 hover:opacity-100"
            aria-label="Visitar meu perfil no GitHub"
            icon={GitHubIcon}
          />
          <Button
            mode="icon"
            size="lg"
            as="a"
            href="mailto:mitsrael9@gmail.com?subject=Oportunidade%20de%20trabalho%20-%20Desenvolvedor%20Full-Stack&body=Olá%20Mitsrael%2C%0A%0AEncontrei%20seu%20portfólio%20e%20gostaria%20de%20conversar%20sobre%20uma%20oportunidade."
            aria-label="Enviar um e-mail"
            className="opacity-70 hover:opacity-100"
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
            className="opacity-70 hover:opacity-100"
            icon={LinkedInIcon}
          />
        </div>

        <Text className="md:absolute md:left-0 opacity-70 ">
          &copy; {new Date().getFullYear()} - Mitsrael Souza
        </Text>
      </div>
    </Container>
  );
}

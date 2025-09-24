import { useEffect, useState } from "react";
import NodeIcon from "./assets/icons/nodedotjs.svg?react";
import CSSIcon from "./assets/icons/css3.svg?react";
import HTMLIcon from "./assets/icons/html5.svg?react";
import SpinnerIcon from "./assets/icons/spinner.svg?react";
import GitHubIcon from "./assets/icons/github.svg?react";
import LinkedInIcon from "./assets/icons/linkedin.svg?react";
import DiscordIcon from "./assets/icons/discord.svg?react";
import ArrowLeftIcon from "./assets/icons/arrow-left.svg?react";
import Icon from "./components/icon";
import Text from "./components/text";
import Button from "./components/button";
import ThemeSwitcher from "./components/theme-switcher";
import IntroSplash from "./components/intro-splash";
import ButtonIcon from "./components/button-icon";
import ButtonText from "./components/button-text";
import Container from "./components/container";

export default function App() {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    // remove splash mínimo do index.html
    const splash = document.getElementById("splash");
    if (splash) splash.remove();

    // Verifica localStorage para intro
    const alreadyVisited = localStorage.getItem("visited");
    if (!alreadyVisited) {
      localStorage.setItem("visited", "true");
    }
    setShowIntro(true);
  }, []);

  if (showIntro) {
    return <IntroSplash onFinish={() => setShowIntro(false)} />;
  }

  return (
    <Container>
      <div className="grid gap-8 mt-4">
        <ThemeSwitcher />
        <div className="flex flex-col gap-1">
          <Text as="p" variant="heading-hero" className="mb-8">
            Componentes
          </Text>
          <Text>Componente de texto</Text>
        </div>
        <div className="flex gap-1 h-8">
          <Icon
            svg={SpinnerIcon}
            className="fill-icon-primary"
            animate="spin"
          />
          <Icon svg={NodeIcon} className="fill-icon-primary" />
          <Icon svg={CSSIcon} className="fill-icon-primary" />
          <Icon svg={HTMLIcon} className="fill-icon-primary" />
        </div>
        <div className="flex gap-3">
          <Button icon={GitHubIcon}>GitHub</Button>
          <Button icon={LinkedInIcon}>LinkedIn</Button>
          <Button>GitHub</Button>
          <Button variant="secondary" size="lg">
            Entre em contato
          </Button>
        </div>

        <div className="flex gap-3 h-8">
          <ButtonIcon icon={LinkedInIcon} />
          <ButtonIcon icon={DiscordIcon} variant="secondary" />
        </div>

        <div className="flex gap-3 h-8">
          <ButtonText icon={ArrowLeftIcon}>Voltar</ButtonText>
          <ButtonText>Ver mais</ButtonText>
        </div>
      </div>
    </Container>
  );
}

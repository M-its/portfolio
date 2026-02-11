import NodeIcon from "../assets/icons/nodedotjs.svg?react";
import CSSIcon from "../assets/icons/css3.svg?react";
import HTMLIcon from "../assets/icons/html5.svg?react";
import SpinnerIcon from "../assets/icons/spinner.svg?react";
import GitHubIcon from "../assets/icons/github.svg?react";
import LinkedInIcon from "../assets/icons/linkedin.svg?react";
import DiscordIcon from "../assets/icons/discord.svg?react";
import ArrowLeftIcon from "../assets/icons/arrow-left.svg?react";

import Icon from "../components/icon";
import Text from "../components/text";
import Button from "../components/button";
import ButtonIcon from "../components/button-icon";
import ButtonText from "../components/button-text";
import Container from "../components/container";
import Card from "../components/card";
import TechCard from "../core-components/tech-card";
import Skeleton from "../components/skeleton";
import Divider from "../components/divider";
// import ProjectCard from "../core-components/project-card";
import Tag from "../components/tag";
import ProjectsContainer from "../core-components/projects-container";

export default function PageComponents() {
  return (
    <Container className="grid gap-12 mt-4 mb-4 p-8">
      <Text as="h1" variant="heading-hero">
        Component Showcase
      </Text>

      <section className="grid gap-4">
        <Text as="h2" variant="heading-section">
          Text & Icons
        </Text>
        <Text>Componente de texto</Text>
        <Text variant="button-label">button-label</Text>
        <Text variant="heading-hero">heading-hero</Text>
        <Text variant="heading-section">heading-section</Text>
        <Text variant="label-header">label-header</Text>
        <Text variant="paragraph-medium">paragraph-medium</Text>
        <Text variant="subtitle">subtitle</Text>
        <Text variant="tech-label">tech-label</Text>

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
      </section>

      <Divider />

      <section className="grid gap-4">
        <Text as="h2" variant="heading-section">
          Buttons
        </Text>
        <div className="flex flex-wrap items-start gap-3">
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
      </section>

      <Divider />

      <section className="grid gap-4">
        <Text as="h2" variant="heading-section">
          Cards
        </Text>
        <div className="flex flex-wrap gap-3">
          <Card size="md" className="flex flex-col gap-4 h-28">
            <Icon svg={NodeIcon} className="fill-btn-primary-text" />
            <Text className="text-btn-primary-text">Card</Text>
          </Card>

          <TechCard size="md" className="flex flex-col gap-4 h-28">
            <Icon
              svg={NodeIcon}
              className="transform-[translateZ(20px)] fill-btn-primary-text"
            />
            <Text className="transform-[translateZ(15px)] text-btn-primary-text">
              TechCard
            </Text>
          </TechCard>
        </div>
      </section>

      <Divider />

      <ProjectsContainer />

      <Divider />

      <section className="grid gap-4">
        <Text as="h2" variant="heading-section">
          Tags
        </Text>
        <div className="flex flex-wrap gap-5">
          <Tag>React</Tag>
          <Tag variant="secondary">Node</Tag>
          <Tag loading>Node</Tag>
        </div>
      </section>

      <Divider />

      <section className="grid gap-4">
        <Text as="h2" variant="heading-section">
          Skeletons
        </Text>
        <div className="flex flex-col gap-3">
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-full h-8" />
        </div>
      </section>
    </Container>
  );
}

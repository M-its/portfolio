import { useState } from "react";
import { techs as techsData } from "../data/techs";
import { SOCIAL_LINKS } from "../data/constants";

import NodeIcon from "../assets/icons/nodedotjs.svg?react";
import SpinnerIcon from "../assets/icons/spinner.svg?react";
import GitHubIcon from "../assets/icons/github.svg?react";
import LinkedInIcon from "../assets/icons/linkedin.svg?react";
import ArrowLeftIcon from "../assets/icons/arrow-left.svg?react";

import Icon from "../components/icon";
import Text from "../components/text";
import Button from "../components/button";
import Container from "../components/container";
import Card from "../components/card";
import Skeleton from "../components/skeleton";
import Divider from "../components/divider";
import Tag from "../components/tag";
import AnimatedSection, {
  animationVariants,
} from "../components/animated-section";
import ScrollIndicator from "../components/scroll-indicator";
import ThemeSwitcher from "../components/theme-switcher";

import ProjectsContainer from "../core-components/projects-container";
import TechsContainer from "../core-components/techs-container";
import TechCard from "../core-components/tech-card";

import TagsList from "../core-components/tags-list";
import AboutSection from "../core-components/about-section";

function Section({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6">
      <Text
        as="h2"
        variant="heading-section"
        className="opacity-60 uppercase tracking-widest text-sm"
      >
        {title}
      </Text>
      {children}
    </section>
  );
}

function Example({
  label,
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-3 ${wide ? "col-span-full" : ""}`}>
      <Text
        as="span"
        variant="label-header"
        className="opacity-50 font-mono text-xs"
      >
        {label}
      </Text>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export default function PageComponents() {
  const techs = techsData;
  const [scrollIndicatorClicked, setScrollIndicatorClicked] = useState(false);

  return (
    <Container className="flex flex-col gap-16 py-58 px-8">
      <div className="flex flex-col gap-2 border-b border-current/10 pb-12">
        <Text as="h1" variant="heading-hero">
          Component Showcase
        </Text>
        <Text variant="subtitle" className="opacity-50">
          Todos os componentes da aplicação
        </Text>
      </div>

      {/* ── TIPOGRAFIA ─────────────────────────────────────────────────── */}
      <Section title="Tipografia — Text">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { variant: "heading-hero", label: "heading-hero" },
            { variant: "heading-section", label: "heading-section" },
            { variant: "subtitle", label: "subtitle" },
            { variant: "paragraph-medium", label: "paragraph-medium" },
            { variant: "paragraph-card", label: "paragraph-card" },
            { variant: "button-label", label: "button-label" },
            { variant: "label-header", label: "label-header" },
            { variant: "tech-label", label: "tech-label" },
          ].map(({ variant, label }) => (
            <div
              key={variant}
              className="flex flex-col gap-1 p-4 rounded-xl border border-current/10"
            >
              <Text
                as="span"
                className="text-[10px] font-mono opacity-40 uppercase tracking-widest"
              >
                {label}
              </Text>
              <Text
                variant={variant as Parameters<typeof Text>[0]["variant"]}
                className="truncate"
              >
                Mitsrael Souza
              </Text>
            </div>
          ))}
        </div>
      </Section>

      <Divider />

      {/* ── ÍCONES ─────────────────────────────────────────────────────── */}
      <Section title="Ícones — Icon">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {(["sm", "md", "lg", "xl", "2xl"] as const).map((size) => (
            <Example key={size} label={`size ${size}`}>
              <Icon svg={NodeIcon} size={size} className="fill-icon-primary" />
            </Example>
          ))}
          <Example label="animate spin">
            <Icon
              svg={SpinnerIcon}
              animate="spin"
              className="fill-icon-primary"
            />
          </Example>
        </div>
      </Section>

      <Divider />

      {/* ── BOTÕES ─────────────────────────────────────────────────────── */}
      <Section title="Botões — Button">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <Example label="primary + icon">
            <Button icon={GitHubIcon}>GitHub</Button>
            <Button icon={LinkedInIcon}>LinkedIn</Button>
          </Example>

          <Example label="primary, size md">
            <Button>Primary md</Button>
          </Example>

          <Example label="primary, size lg">
            <Button size="lg">Primary lg</Button>
          </Example>

          <Example label="secondary, size lg">
            <Button variant="secondary" size="lg">
              Entre em contato
            </Button>
          </Example>

          <Example label="outline">
            <Button variant="outline">Outline</Button>
          </Example>

          <Example label="mode text">
            <Button mode="text">Ver mais</Button>
            <Button mode="text" icon={ArrowLeftIcon}>
              Voltar
            </Button>
          </Example>

          <Example label="mode icon, variant primary">
            <Button mode="icon" icon={GitHubIcon} size="lg" />
            <Button mode="icon" icon={LinkedInIcon} size="lg" />
          </Example>

          <Example label="mode icon, variant secondary (iconVariant)">
            <Button
              mode="icon"
              icon={GitHubIcon}
              iconVariant="secondary"
              size="xl"
            />
            <Button
              mode="icon"
              icon={LinkedInIcon}
              iconVariant="secondary"
              size="xl"
            />
          </Example>

          <Example label="as link (âncora)">
            <Button
              as="a"
              href="https://github.com/M-its"
              target="_blank"
              rel="noopener noreferrer"
              icon={GitHubIcon}
            >
              GitHub
            </Button>
          </Example>

          <Example label="social links (constants.ts)">
            {SOCIAL_LINKS.map(({ label, ...props }) => (
              <Button
                key={label}
                as="a"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              >
                {label}
              </Button>
            ))}
          </Example>
        </div>
      </Section>

      <Divider />

      {/* ── DIVIDER ────────────────────────────────────────────────────── */}
      <Section title="Divisor — Divider">
        <div className="grid gap-6">
          <Example label="horizontal (padrão)" wide>
            <div className="w-full">
              <Divider />
            </div>
          </Example>
          <Example label="com gradient" wide>
            <div className="w-full">
              <Divider className="bg-gradient-to-r from-transparent via-btn-primary-bg-hover to-transparent" />
            </div>
          </Example>
          <Example label="vertical">
            <div className="h-12 flex items-center">
              <Divider orientation="vertical" className="h-full" />
            </div>
          </Example>
        </div>
      </Section>

      <Divider />

      {/* ── CARD ───────────────────────────────────────────────────────── */}
      <Section title="Cards — Card">
        <div className="flex flex-wrap gap-6">
          <Example label={"Default card"}>
            <Card size="md" className="flex flex-col gap-4 h-28 w-40">
              <Icon svg={NodeIcon} className="fill-btn-primary-text" />
              <Text className="text-btn-primary-text capitalize">Default</Text>
            </Card>
          </Example>
        </div>
      </Section>

      <Divider />

      {/* ── SKELETON ───────────────────────────────────────────────────── */}
      <Section title="Skeleton">
        <div className="flex flex-col gap-6 max-w-md">
          <Example label="rounded lg (padrão)" wide>
            <Skeleton className="w-full h-8" />
          </Example>
          <Example label="rounded sm" wide>
            <Skeleton rounded="sm" className="w-full h-8" />
          </Example>
          <Example label="rounded full (avatar)">
            <Skeleton rounded="full" className="w-12 h-12" />
          </Example>
        </div>
      </Section>

      <Divider />

      {/* ── TAGS ───────────────────────────────────────────────────────── */}
      <Section title="Tags — Tag / TagsList">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <Example label="primary, size sm">
            <Tag>React</Tag>
            <Tag>TypeScript</Tag>
          </Example>
          <Example label="secondary, size sm">
            <Tag variant="secondary">Node</Tag>
            <Tag variant="secondary">Express</Tag>
          </Example>
          <Example label="size md">
            <Tag size="md">React</Tag>
            <Tag size="md" variant="secondary">
              Node
            </Tag>
          </Example>
          <Example label="loading">
            <Tag loading />
            <Tag loading />
            <Tag loading />
          </Example>
          <Example label="TagsList com overflow" wide>
            <div className="w-full max-w-sm">
              <TagsList
                tags={[
                  "React",
                  "TypeScript",
                  "Node.js",
                  "Express",
                  "Fastify",
                  "PostgreSQL",
                  "Docker",
                  "Jest",
                  "Tailwind",
                ]}
              />
            </div>
          </Example>
        </div>
      </Section>

      <Divider />

      {/* ── THEME SWITCHER ─────────────────────────────────────────────── */}
      <Section title="Theme Switcher">
        <Example label="toggle dark/light">
          <ThemeSwitcher />
        </Example>
      </Section>

      <Divider />

      {/* ── SCROLL INDICATOR ───────────────────────────────────────────── */}
      <Section title="Scroll Indicator">
        <Example label="hover para ver animação">
          <ScrollIndicator
            onClick={() => setScrollIndicatorClicked((p) => !p)}
          />
          {scrollIndicatorClicked && (
            <Text variant="button-label" className="opacity-50">
              onClick disparado!
            </Text>
          )}
        </Example>
      </Section>

      <Divider />

      {/* ── ANIMATED SECTION ───────────────────────────────────────────── */}
      <Section title="Animated Section — variantes">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {(["fadeUp", "fadeDown", "blur"] as const).map((variant) => (
            <AnimatedSection
              key={variant}
              variants={animationVariants[variant]}
              repeatOnView
              className="p-6 rounded-xl border border-current/10 text-center"
            >
              <Text variant="button-label" className="opacity-60 font-mono">
                {variant}
              </Text>
            </AnimatedSection>
          ))}
        </div>
      </Section>

      <Divider />

      {/* ── TECH CARD ──────────────────────────────────────────────────── */}
      <Section title="Tech Card — tamanhos">
        <div className="flex flex-wrap gap-6 items-end">
          {(["sm", "md", "lg"] as const).map((size) => (
            <div key={size} className="flex flex-col gap-2 items-center">
              <Text
                as="span"
                className="text-[10px] font-mono opacity-40 uppercase tracking-widest"
              >
                {size}
              </Text>
              <TechCard
                tech={techs.find((t) => t.name === "React")!}
                size={size}
                className="w-24 h-24"
              />
            </div>
          ))}
        </div>
      </Section>

      <Divider />

      {/* ── TECHS CONTAINER ────────────────────────────────────────────── */}
      <Section title="Techs Container">
        <div className="max-w-md">
          <TechsContainer techs={techs} />
        </div>
      </Section>

      <Divider />

      {/* ── ABOUT SECTION ──────────────────────────────────────────────── */}
      <Section title="About Section">
        <AboutSection />
      </Section>

      <Divider />

      {/* ── PROJECTS CONTAINER ─────────────────────────────────────────── */}
      <Section title="Projects Container">
        <ProjectsContainer />
      </Section>
    </Container>
  );
}

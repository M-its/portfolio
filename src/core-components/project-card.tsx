import { useRef } from "react";
import type { VariantProps } from "tailwind-variants";
import Button from "../components/button";
import Card, { type cardVariants } from "../components/card";
import Divider from "../components/divider";
import Text from "../components/text";
import TagsList from "./tags-list";
import useMouseGlare from "../hooks/use-mouse-glare";
import GitHubIcon from "../assets/icons/github.svg?react";
import GlobeIcon from "../assets/icons/globe.svg?react";
import { useTheme } from "../contexts/theme-context";

interface ProjectCardProps
  extends VariantProps<typeof cardVariants>,
    React.ComponentProps<typeof Card> {
  repository: string;
  image: string;
  description: string;
  github_repo: string;
  homepage: string;
  languages: string[];
  featured?: boolean;
}

export default function ProjectCard({
  size,
  variant,
  repository,
  image,
  description,
  github_repo,
  homepage,
  languages,
  featured,
  className,
  ...props
}: ProjectCardProps) {
  const { isDark } = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  useMouseGlare(cardRef);

  return (
    <div
      ref={cardRef}
      className="relative w-full h-full"
      style={
        {
          "--mouse-x": "-9999px",
          "--mouse-y": "-9999px",
          "--mouse-opacity": "0",
        } as React.CSSProperties
      }
    >
      <div
        className={`
          relative group h-full w-full rounded-2xl overflow-hidden
          transition-all duration-500 ease-out
          bg-card-bg
          ${featured ? "hover:scale-[1.015]" : "hover:scale-[1.01]"}
          ${className}
        `}
      >
        {/* BORDA BASE */}
        <div
          className={`
          absolute inset-0 rounded-2xl pointer-events-none z-1 border
          ${isDark ? "border-white/5" : "border-icon-primary/10"}
        `}
        />

        {/* EFEITO DE REVEAL */}
        {isDark && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none z-2 transition-opacity duration-300"
            style={{
              opacity: "var(--mouse-opacity)",
              maskImage:
                "radial-gradient(180px circle at var(--mouse-x) var(--mouse-y), black, transparent)",
              WebkitMaskImage:
                "radial-gradient(180px circle at var(--mouse-x) var(--mouse-y), black, transparent)",
            }}
          >
            {/* BORDA DE REVEAL */}
            <div className="absolute inset-0 rounded-2xl border-[1.5px] border-white/40" />

            {/* GLARE DE FUNDO */}
            <div className="absolute inset-0 bg-white/4" />
          </div>
        )}

        <Card
          {...props}
          className={`relative z-10 bg-transparent border-0 p-5 flex flex-col gap-3 w-full h-full ${className ?? ""}`}
        >
          {/* Cabeçalho do Card */}
          <div className="flex justify-between items-start w-full">
            <Button
              mode="text"
              size="lg"
              align="left"
              className={
                featured
                  ? "text-2xl sm:text-4xl capitalize font-display font-medium"
                  : "text-2xl capitalize"
              }
              as="a"
              target="_blank"
              rel="noopener noreferrer"
              href={homepage}
            >
              {repository}
            </Button>
          </div>

          {/* Container principal */}
          <div
            className={`flex ${
              featured
                ? "flex-col sm:flex-row gap-6 sm:gap-8 mt-2"
                : "flex-col gap-4"
            } flex-1`}
          >
            {/* Imagem */}
            <div
              className={
                featured ? "shrink-0 w-full sm:w-1/2 lg:w-[45%]" : "w-full"
              }
            >
              <div className="relative overflow-hidden rounded-md border border-btn-primary-bg-hover/30">
                {featured && (
                  <div className="absolute inset-0 bg-btn-secondary-bg/5 mix-blend-overlay pointer-events-none" />
                )}

                <img
                  src={image}
                  alt={`Capa do projeto ${repository}`}
                  className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                    featured
                      ? "h-64 sm:h-full sm:min-h-64 object-top"
                      : "h-42 object-top"
                  }`}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            {/* Conteúdo */}
            <div
              className={`flex flex-col gap-3 sm:gap-4 min-w-0 ${
                featured ? "flex-1 justify-center py-2" : "w-full"
              }`}
            >
              <div className="flex flex-col gap-4">
                <Text
                  variant="paragraph-card"
                  className={
                    featured
                      ? "text-lg leading-relaxed text-text-primary line-clamp-none mb-2"
                      : "line-clamp-2 h-14"
                  }
                >
                  {description}
                </Text>

                <TagsList
                  tags={languages}
                  className={
                    featured
                      ? "flex-wrap gap-2"
                      : "sm:h-16 sm:overflow-y-auto custom-scrollbar"
                  }
                />
              </div>

              {/* Botões */}
              <div
                className={`flex flex-col gap-4 ${
                  featured ? "mt-auto pt-6" : "mt-4 sm:mt-0"
                }`}
              >
                <Divider className="w-full opacity-80" />

                <div className="flex gap-4">
                  <Button
                    as="a"
                    href={github_repo}
                    className={`w-full ${
                      featured
                        ? "bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-bg-hover border-transparent"
                        : "border border-btn-primary-bg-hover"
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ver código do projeto ${repository} no GitHub`}
                    icon={GitHubIcon}
                  >
                    GitHub
                  </Button>
                  <Button
                    as="a"
                    href={homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-btn-primary-bg-hover w-full"
                    icon={GlobeIcon}
                    aria-label={`Visitar o site do projeto ${repository}`}
                  >
                    Site
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

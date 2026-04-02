import { useRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import Button from "../components/button";
import Card, { type cardVariants } from "../components/card";
import Divider from "../components/divider";
import Text from "../components/text";
import TagsList from "./tags-list";
import useMouseGlare from "../hooks/use-mouse-glare";
import GitHubIcon from "../assets/icons/github.svg?react";
import GlobeIcon from "../assets/icons/globe.svg?react";
import { useTheme } from "../contexts/theme-context";

const projectCardVariants = tv({
  slots: {
    container: "relative w-full h-full",
    wrapper:
      "relative group h-full w-full rounded-3xl overflow-hidden transition-all duration-500 ease-out hover:scale-[1.01]",
    baseBorder:
      "absolute inset-0 rounded-3xl pointer-events-none z-1 border border-white/5",
    revealWrapper:
      "absolute inset-0 rounded-3xl pointer-events-none z-2 transition-opacity duration-300",
    revealBorder: "absolute inset-0 rounded-3xl border-[1.5px] border-white/30",
    revealGlare: "absolute inset-0 bg-white/3",
    content:
      "relative z-10 bg-transparent border-0 p-6 flex flex-col gap-4 w-full h-full",
  },
  variants: {
    isDark: {
      true: {
        wrapper: "bg-white/2 backdrop-blur-md hover:bg-white/4",
        baseBorder: "border-btn-primary-bg-hover",
      },
      false: {
        wrapper: "bg-white/50 backdrop-blur-md hover:bg-white/80",
        baseBorder: "border-btn-primary-bg-hover/50",
      },
    },
  },
});

interface ProjectCardProps
  extends VariantProps<typeof cardVariants>,
    React.ComponentProps<typeof Card> {
  repository: string;
  name: string;
  image: string;
  description: string;
  github_repo: string;
  homepage: string;
  languages: string[];
}

export default function ProjectCard({
  size,
  variant,
  repository,
  name,
  image,
  description,
  github_repo,
  homepage,
  languages,
  className,
  ...props
}: ProjectCardProps) {
  const { isDark } = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  useMouseGlare(cardRef);

  const {
    container,
    wrapper,
    baseBorder,
    revealWrapper,
    revealBorder,
    revealGlare,
    content,
  } = projectCardVariants({ isDark });

  return (
    <div
      ref={cardRef}
      className={container()}
      style={
        {
          "--mouse-x": "-9999px",
          "--mouse-y": "-9999px",
          "--mouse-opacity": "0",
        } as React.CSSProperties
      }
    >
      <div className={`${wrapper()} ${className ?? ""}`}>
        <div className={baseBorder()} />

        {isDark && (
          <div
            className={revealWrapper()}
            style={{
              opacity: "var(--mouse-opacity)",
              maskImage:
                "radial-gradient(180px circle at var(--mouse-x) var(--mouse-y), black, transparent)",
              WebkitMaskImage:
                "radial-gradient(180px circle at var(--mouse-x) var(--mouse-y), black, transparent)",
            }}
          >
            <div className={revealBorder()} />
            <div className={revealGlare()} />
          </div>
        )}

        <Card {...props} className={content()}>
          <div className="flex justify-between items-start w-full">
            <Button
              mode="text"
              size="lg"
              align="left"
              className="project-card-title capitalize"
              as="a"
              target="_blank"
              rel="noopener noreferrer"
              href={homepage}
              aria-label={`Visitar o site do projeto ${name} (abre em nova aba)`}
            >
              {name}
            </Button>
          </div>

          <div className="project-card-body flex flex-col gap-3.5 flex-1">
            <div className="project-card-image w-full">
              <div className="relative overflow-hidden rounded-md border border-btn-primary-bg-hover/30">
                <img
                  src={image}
                  alt={`Capa do projeto ${repository}`}
                  className="project-card-img w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                  width="1280"
                  height="720"
                />
              </div>
            </div>

            <div className="project-card-content flex flex-col gap-3 sm:gap-4 min-w-0 w-full h-full">
              <div className="flex flex-col gap-5">
                <Text
                  variant="paragraph-card"
                  className="project-card-description line-clamp-2 h-14"
                >
                  {description}
                </Text>

                <TagsList
                  tags={languages}
                  className="sm:h-16 sm:overflow-y-auto custom-scrollbar"
                />
              </div>

              <div className="flex flex-col gap-4 mt-auto pt-2">
                <Divider className="w-full opacity-80" />
                <div className="flex gap-4">
                  <Button
                    as="a"
                    href={github_repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ver código do projeto ${repository} no GitHub (abre em nova aba)`}
                    icon={GitHubIcon}
                    className="w-full border border-btn-primary-bg-hover"
                  >
                    GitHub
                  </Button>
                  <Button
                    as="a"
                    href={homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visitar o site do projeto ${repository} (abre em nova aba)`}
                    icon={GlobeIcon}
                    className="border border-btn-primary-bg-hover w-full"
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

import { useRef } from "react";
import { Link } from "react-router-dom";
import { type VariantProps, tv } from "tailwind-variants";
import FileTextIcon from "../assets/icons/file-text.svg?react";
import GitHubIcon from "../assets/icons/github.svg?react";
import GlobeIcon from "../assets/icons/globe.svg?react";
import Button from "../components/button";
import Card, { type cardVariants } from "../components/card";
import Text from "../components/text";
import type { ProjectData } from "../data/projects";
import useMouseGlare from "../hooks/use-mouse-glare";
import useProjectTransition from "../hooks/use-project-transition";
import TagsList from "./tags-list";

const projectCardVariants = tv({
  slots: {
    container: "relative w-full h-full",
    wrapper:
      "relative group h-full w-full rounded-3xl overflow-hidden bg-project-card-surface backdrop-blur-md transition-all duration-500 ease-out hover:scale-[1.01] hover:bg-project-card-surface-hover",
    baseBorder:
      "absolute inset-px rounded-[calc(1.5rem-1px)] pointer-events-none z-20 border border-card-border/50",
    revealWrapper:
      "absolute inset-px rounded-[calc(1.5rem-1px)] pointer-events-none z-30 transition-opacity duration-300",
    revealBorder:
      "absolute inset-0 rounded-3xl border-[1.5px] border-project-card-reveal-border",
    revealGlare: "absolute inset-0 bg-project-card-reveal-surface",
    content:
      "relative z-10 bg-transparent border-0 p-5 flex flex-col gap-4 w-full h-full",
  },
});

interface ProjectCardProps
  extends VariantProps<typeof cardVariants>,
    React.ComponentProps<typeof Card> {
  project: ProjectData;
}

export default function ProjectCard({
  size,
  variant,
  project,
  className,
  ...props
}: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const handleProjectNavigation = useProjectTransition(imageFrameRef);

  useMouseGlare(cardRef);

  const {
    container,
    wrapper,
    baseBorder,
    revealWrapper,
    revealBorder,
    revealGlare,
    content,
  } = projectCardVariants();
  const optimizedImageBase = project.image.endsWith(".png")
    ? project.image.slice(0, -".png".length)
    : null;

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
      {/* A classe project-card permite congelar o hover antes do snapshot — bug #4. */}
      <div className={`project-card ${wrapper()} ${className ?? ""}`}>
        <div className={baseBorder()} />

        <div
          className={`project-card-theme-reveal ${revealWrapper()}`}
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

        <Card {...props} className={content()}>
          <div className="project-card-header flex items-center justify-between gap-4 w-full">
            <Text
              as="h3"
              variant="heading-section"
              className="project-card-title capitalize font-medium tracking-wider"
            >
              {project.name}
            </Text>
            <Button
              mode="icon"
              size="md"
              as={Link}
              to={`/projects/${project.slug}`}
              onClick={(event) =>
                handleProjectNavigation(event, `/projects/${project.slug}`)
              }
              icon={FileTextIcon}
              variant="outline"
              title={`Ver estudo de caso de ${project.name}`}
              aria-label={`Ver estudo de caso do projeto ${project.name}`}
              className="project-card-case-link rounded-md border border-current/20 bg-icon-button-surface p-1 text-text-primary opacity-65 hover:opacity-100 hover:scale-105"
            />
          </div>

          <div className="project-card-body flex flex-col gap-4 flex-1 min-h-0">
            <div className="project-card-image w-full">
              <div
                ref={imageFrameRef}
                className="project-card-image-frame relative overflow-hidden rounded-md border border-button-primary-surface-hover/30 aspect-video"
              >
                <Link
                  to={`/projects/${project.slug}`}
                  onClick={(event) =>
                    handleProjectNavigation(event, `/projects/${project.slug}`)
                  }
                  className="block h-full w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  aria-label={`Ver estudo de caso do projeto ${project.name}`}
                >
                  <picture className="block h-full w-full">
                    {optimizedImageBase && (
                      <source
                        type="image/webp"
                        srcSet={`${optimizedImageBase}-1280.webp`}
                      />
                    )}
                    <img
                      src={project.image}
                      alt={project.imageAlt}
                      className="project-card-img block w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                      width="1280"
                      height="720"
                    />
                  </picture>
                </Link>
              </div>
            </div>

            <div className="project-card-content flex flex-col gap-4 min-w-0 w-full h-full">
              <div className="flex flex-col items-start">
                <Text
                  as="p"
                  variant="paragraph-card"
                  title={project.summary}
                  className="project-card-description line-clamp-3 h-[4.875rem]"
                >
                  {project.summary}
                </Text>
              </div>

              <div className="project-card-meta mt-auto flex flex-col gap-3">
                <TagsList
                  tags={project.technologies}
                  maxVisibleItems={5}
                  expandable={false}
                  className="project-card-tags h-[4.5rem]"
                />
                <div className="project-card-actions flex gap-4 pt-4 border-t border-button-primary-surface-hover/50">
                  <Button
                    as="a"
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ver código do projeto ${project.name} no GitHub (abre em nova aba)`}
                    icon={GitHubIcon}
                    className="w-full border border-button-primary-surface-hover"
                  >
                    GitHub
                  </Button>
                  <Button
                    as="a"
                    href={project.links.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visitar o site do projeto ${project.name} (abre em nova aba)`}
                    icon={GlobeIcon}
                    className="border border-button-primary-surface-hover w-full"
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

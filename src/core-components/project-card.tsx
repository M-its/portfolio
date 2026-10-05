import { useRef } from "react";
import { Link } from "react-router-dom";
import { type VariantProps, tv } from "tailwind-variants";
import FileTextIcon from "../assets/icons/file-text.svg?react";
import GitHubIcon from "../assets/icons/github.svg?react";
import GlobeIcon from "../assets/icons/globe.svg?react";
import Button from "../components/button";
import Card, { type cardVariants } from "../components/card";
import Text from "../components/text";
import MouseGlare from "../components/mouse-glare";
import type { ProjectData } from "../data/projects";
import useMouseGlare from "../hooks/use-mouse-glare";
import useProjectTransition from "../hooks/use-project-transition";
import { loadProjectDetailsPage } from "../utils/project-details-loader";
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
  const revealRef = useRef<HTMLDivElement>(null);
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const handleProjectNavigation = useProjectTransition(imageFrameRef);

  useMouseGlare(cardRef, revealRef);

  const { container, wrapper, baseBorder, revealWrapper, content } =
    projectCardVariants();
  const optimizedImageBase = project.image.endsWith(".png")
    ? project.image.slice(0, -".png".length)
    : null;

  return (
    <div ref={cardRef} className={container()}>
      {/* A classe project-card permite congelar o hover antes do snapshot — bug #4. */}
      <div className={`project-card ${wrapper()} ${className ?? ""}`}>
        <div className={baseBorder()} />

        <MouseGlare
          ref={revealRef}
          className={`project-card-theme-reveal ${revealWrapper()}`}
          radius={180}
          borderClassName="rounded-3xl"
          borderColor="var(--color-project-card-reveal-border)"
          surfaceColor="var(--color-project-card-reveal-surface)"
        />

        <Card {...props} size={size} variant={variant} className={content()}>
          <div className="project-card-header flex items-center justify-between gap-4 w-full">
            <a
              href={project.links.live}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-text-primary"
              aria-label={`Visitar o site do projeto ${project.name} (abre em nova aba)`}
            >
              <Text
                as="h3"
                variant="heading-section"
                className="project-card-title capitalize font-medium tracking-wider transition-opacity hover:opacity-70"
              >
                {project.name}
              </Text>
            </a>
            <Button
              mode="icon"
              size="md"
              as={Link}
              to={`/projects/${project.slug}`}
              onClick={(event) =>
                handleProjectNavigation(event, `/projects/${project.slug}`)
              }
              onFocus={() => void loadProjectDetailsPage()}
              onPointerEnter={() => void loadProjectDetailsPage()}
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
                  onFocus={() => void loadProjectDetailsPage()}
                  onPointerEnter={() => void loadProjectDetailsPage()}
                  className="block h-full w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-text-primary"
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
                    className="w-full border border-button-primary-surface-hover before:hidden"
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
                    className="border border-button-primary-surface-hover w-full before:hidden"
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

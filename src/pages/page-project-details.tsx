import { useLayoutEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import GitHubIcon from "../assets/icons/github.svg?react";
import GlobeIcon from "../assets/icons/globe.svg?react";
import AnimatedSection, {
  animationVariants,
} from "../components/animated-section";
import Button from "../components/button";
import Container from "../components/container";
import Divider from "../components/divider";
import Tag from "../components/tag";
import Text from "../components/text";
import {
  type ProjectData,
  getProjectBySlug,
  projectsBase,
} from "../data/projects";
import {
  type ProjectTransitionLocationState,
  initializeProjectDetailsScroll,
  navigateBackToHome,
} from "../hooks/use-project-transition";
import PageProjectNotFound from "./page-project-not-found";

const statusLabels = {
  "em-producao": "Em produção",
  concluido: "Concluído",
} as const;

function ProjectNavigation({ project }: { project: ProjectData }) {
  const projectIndex = projectsBase.findIndex(
    ({ slug }) => slug === project.slug,
  );
  const previousProject = projectsBase[projectIndex - 1];
  const nextProject = projectsBase[projectIndex + 1];

  return (
    <nav
      aria-label="Navegação entre projetos"
      className="grid gap-4 sm:grid-cols-2"
    >
      {previousProject ? (
        <Link
          to={`/projects/${previousProject.slug}`}
          className="group rounded-2xl border border-card-border bg-surface-subtle p-5 transition-colors hover:bg-surface-subtle-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-text-primary"
        >
          <span className="text-xs uppercase tracking-[0.24em] opacity-55">
            Projeto anterior
          </span>
          <span className="mt-2 block text-xl font-medium group-hover:text-text-primary">
            ← {previousProject.name}
          </span>
        </Link>
      ) : (
        <div />
      )}

      {nextProject ? (
        <Link
          to={`/projects/${nextProject.slug}`}
          className="group rounded-2xl border border-card-border bg-surface-subtle p-5 text-right transition-colors hover:bg-surface-subtle-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-text-primary"
        >
          <span className="text-xs uppercase tracking-[0.24em] opacity-55">
            Próximo projeto
          </span>
          <span className="mt-2 block text-xl font-medium group-hover:text-text-primary">
            {nextProject.name} →
          </span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}

export default function PageProjectDetails() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const project = slug ? getProjectBySlug(slug) : undefined;
  const locationState = location.state as ProjectTransitionLocationState | null;
  const fromCardTransition = locationState?.fromCardTransition === true;

  useLayoutEffect(() => {
    if (!slug) return;

    // Só acessos diretos vão ao topo; o coordenador resolve a corrida do bug #1.
    initializeProjectDetailsScroll(fromCardTransition);
  }, [fromCardTransition, slug]);

  if (!project) return <PageProjectNotFound />;

  const optimizedImageBase = project.image.endsWith(".png")
    ? project.image.slice(0, -".png".length)
    : null;
  const projectType = project.role.includes("Full-Stack")
    ? "Projeto Full Stack"
    : "Projeto Frontend";

  return (
    <Container as="main" className="pt-28 sm:pt-32 md:pt-36">
      <div className="project-details-reveal">
        <Link
          to="/"
          onClick={(event) => {
            event.preventDefault();
            navigateBackToHome(navigate, fromCardTransition);
          }}
          className="inline-flex items-center gap-2 text-sm font-medium opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-text-primary"
        >
          <span aria-hidden="true">←</span>
          Voltar ao início
        </Link>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)] lg:items-center lg:gap-10 xl:grid-cols-[minmax(320px,0.68fr)_minmax(0,1.32fr)] xl:gap-12">
        <section className="project-details-reveal order-2 lg:order-1 lg:py-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] opacity-65">
            <span>Estudo de caso</span>
            <span aria-hidden="true">•</span>
            <span>{statusLabels[project.status]}</span>
            {project.year && (
              <>
                <span aria-hidden="true">•</span>
                <span>{project.year}</span>
              </>
            )}
          </div>
          <Text
            as="h1"
            className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl xl:text-6xl"
          >
            {project.name}
          </Text>
          <Text
            as="p"
            variant="paragraph-medium"
            className="mt-5 max-w-2xl text-base opacity-80 md:text-lg xl:text-xl"
          >
            {project.description}
          </Text>

          <div className="mt-6 inline-flex items-center text-sm font-medium">
            <span>{projectType}</span>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              as="a"
              href={project.links.live}
              target="_blank"
              rel="noopener noreferrer"
              icon={GlobeIcon}
              className="w-full sm:w-auto"
              aria-label={`Abrir ${project.name} (abre em nova aba)`}
            >
              Visitar projeto
            </Button>
            <Button
              as="a"
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              icon={GitHubIcon}
              variant="outline"
              className="w-full sm:w-auto [&_svg]:fill-text-primary"
              aria-label={`Ver código do ${project.name} no GitHub (abre em nova aba)`}
            >
              Ver código
            </Button>
          </div>
        </section>

        <div
          data-project-hero={project.slug}
          className="order-1 overflow-hidden rounded-3xl border border-card-border bg-card-surface lg:order-2"
          style={{ viewTransitionName: "project-image" }}
        >
          <picture className="block">
            {optimizedImageBase && (
              <source
                type="image/webp"
                srcSet={`${optimizedImageBase}-1280.webp`}
              />
            )}
            <img
              src={project.image}
              alt={project.imageAlt}
              width="1280"
              height="720"
              className="block h-auto w-full object-cover"
            />
          </picture>
        </div>
      </div>

      <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
        <div className="space-y-12">
          <AnimatedSection
            variants={animationVariants.fadeUp}
            repeatOnView={false}
          >
            <Text as="h2" variant="heading-section" className="text-2xl">
              Contexto e solução
            </Text>
            <div className="mt-5 space-y-5 text-lg leading-relaxed opacity-80">
              <p>{project.caseStudy?.context ?? project.description}</p>
              <p>{project.caseStudy?.solution ?? project.summary}</p>
            </div>
          </AnimatedSection>

          {project.caseStudy?.architecture && (
            <AnimatedSection
              variants={animationVariants.fadeUp}
              repeatOnView={false}
            >
              <Text as="h2" variant="heading-section" className="text-2xl">
                Arquitetura
              </Text>
              <p className="mt-5 text-lg leading-relaxed opacity-80">
                {project.caseStudy.architecture}
              </p>
            </AnimatedSection>
          )}

          {(project.caseStudy?.challenges || project.caseStudy?.decisions) && (
            <AnimatedSection
              variants={animationVariants.fadeUp}
              repeatOnView={false}
              className="grid gap-8 md:grid-cols-2"
            >
              {project.caseStudy.challenges && (
                <section>
                  <Text as="h2" variant="heading-section" className="text-2xl">
                    Desafios
                  </Text>
                  <ul className="mt-5 space-y-3 leading-relaxed opacity-80">
                    {project.caseStudy.challenges.map((challenge) => (
                      <li key={challenge} className="flex gap-3">
                        <span aria-hidden="true" className="text-text-primary">
                          —
                        </span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {project.caseStudy.decisions && (
                <section>
                  <Text as="h2" variant="heading-section" className="text-2xl">
                    Decisões
                  </Text>
                  <ul className="mt-5 space-y-3 leading-relaxed opacity-80">
                    {project.caseStudy.decisions.map((decision) => (
                      <li key={decision} className="flex gap-3">
                        <span aria-hidden="true" className="text-text-primary">
                          —
                        </span>
                        {decision}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </AnimatedSection>
          )}
        </div>

        <aside className="space-y-8">
          <AnimatedSection
            variants={animationVariants.fadeUp}
            repeatOnView={false}
            className="rounded-2xl border border-card-border bg-surface-subtle p-6"
          >
            <Text as="h2" variant="heading-section" className="text-xl">
              Stack
            </Text>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.technologies.map((technology) => (
                <Tag key={technology}>{technology}</Tag>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection
            variants={animationVariants.fadeUp}
            repeatOnView={false}
            className="rounded-2xl border border-card-border bg-surface-subtle p-6"
          >
            <Text as="h2" variant="heading-section" className="text-xl">
              Destaques
            </Text>
            <ul className="mt-5 space-y-4 leading-relaxed opacity-80">
              {project.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </AnimatedSection>

          <AnimatedSection
            variants={animationVariants.fadeUp}
            repeatOnView={false}
            className="rounded-2xl border border-card-border bg-surface-subtle p-6"
          >
            <Text as="h2" variant="heading-section" className="text-xl">
              Resultados e aprendizados
            </Text>
            <ul className="mt-5 space-y-4 leading-relaxed opacity-80">
              {project.results.map((result) => (
                <li key={result}>{result}</li>
              ))}
            </ul>
          </AnimatedSection>
        </aside>
      </div>

      <AnimatedSection
        variants={animationVariants.fadeUp}
        repeatOnView={false}
        className="mt-16"
      >
        <Divider className="mb-8 opacity-50" />
        <ProjectNavigation project={project} />
      </AnimatedSection>
    </Container>
  );
}

import { Suspense, lazy, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import Button from "../components/button";
import Container from "../components/container";
import ScrollIndicator from "../components/scroll-indicator";
import Text from "../components/text";

import { type Variants, motion } from "framer-motion";
import AnimatedSection, {
  animationVariants,
} from "../components/animated-section.tsx";
import AboutSection from "../core-components/about-section.tsx";
import { BUTTON_CONFIG, SOCIAL_LINKS } from "../data/constants.ts";
import { techs } from "../data/techs.ts";
import useMediaQuery from "../hooks/use-media-query.ts";
import { useOnScreen } from "../hooks/use-on-screen.ts";
import { initializeHomeScroll } from "../hooks/use-project-transition.ts";
import useScrollToSection from "../hooks/use-scroll-to-section.ts";

const TechsContainer = lazy(
  () => import("../core-components/techs-container.tsx"),
);
const ProjectsContainer = lazy(
  () => import("../core-components/projects-container.tsx"),
);

const buttonContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const buttonVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function PageHome() {
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 639px)");
  const isSquished = useMediaQuery(
    "(min-width: 1024px) and (max-width: 1080px)",
  );
  const isCompact = isMobile || isSquished;
  const buttonConfig = isCompact ? BUTTON_CONFIG.icon : BUTTON_CONFIG.button;
  const scrollToSection = useScrollToSection();
  const [techLoadRef, isTechNearViewport] = useOnScreen({
    rootMargin: "50px",
    triggerOnce: true,
  });
  const [projectsLoadRef, areProjectsNearViewport] = useOnScreen({
    rootMargin: "300px",
    triggerOnce: true,
  });

  useLayoutEffect(() => {
    // O coordenador restaura antes do paint e remove o scroll global — bugs #2 e #3.
    return initializeHomeScroll(location.hash);
  }, [location.hash]);

  return (
    <Container
      as="main"
      className="pt-56 lg:pt-60 xl:pt-68 flex flex-col gap-24 md:gap-28"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-24 lg:gap-16 xl:gap-20 items-stretch">
        <div className="flex flex-col gap-24 md:gap-24">
          <AnimatedSection id="home">
            <Text
              as="h1"
              variant="heading-hero"
              className="mb-2 tracking-wider"
            >
              Mitsrael Souza
            </Text>
            <Text variant="subtitle">Desenvolvedor Full-Stack</Text>

            <motion.div
              className="flex gap-4 xl:gap-6 mt-6 md:mt-8"
              variants={buttonContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {SOCIAL_LINKS.map(({ label, ...linkProps }) => (
                <motion.div key={label} variants={buttonVariants}>
                  <Button
                    as="a"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Acessar meu ${label}`}
                    {...buttonConfig}
                    {...linkProps}
                  >
                    {!isCompact && label}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </AnimatedSection>

          <div id="about">
            <AboutSection />
          </div>
        </div>

        <div id="stack" ref={techLoadRef}>
          {!isMobile || isTechNearViewport ? (
            <Suspense fallback={<div className="min-h-[400px]" />}>
              <TechsContainer techs={techs} />
            </Suspense>
          ) : (
            <div className="min-h-[400px]" aria-hidden="true" />
          )}
        </div>
      </div>

      <AnimatedSection
        animateOnMount={true}
        className="hidden lg:block self-center -mt-12"
      >
        <ScrollIndicator onClick={() => scrollToSection("projects")} />
      </AnimatedSection>

      <div id="projects" ref={projectsLoadRef}>
        {areProjectsNearViewport ? (
          <AnimatedSection variants={animationVariants.fadeUp}>
            <Suspense fallback={<div className="min-h-[600px]" />}>
              <ProjectsContainer />
            </Suspense>
          </AnimatedSection>
        ) : (
          <div className="min-h-[600px]" aria-hidden="true" />
        )}
      </div>
    </Container>
  );
}

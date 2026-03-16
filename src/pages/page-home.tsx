import Button from "../components/button";
import Container from "../components/container";
import Text from "../components/text";
import ProjectsContainer from "../core-components/projects-container";
import ScrollIndicator from "../components/scroll-indicator";

import useScrollToSection from "../hooks/use-scroll-to-section.ts";
import useMediaQuery from "../hooks/use-media-query.ts";
import { motion, type Variants } from "framer-motion";
import AnimatedSection from "../components/animated-section.tsx";
import { useEffect } from "react";
import TechsContainer from "../core-components/techs-container.tsx";
import { techs } from "../data/techs.ts";
import { BUTTON_CONFIG, SOCIAL_LINKS } from "../data/constants.ts";
import AboutSection from "../core-components/about-section.tsx";

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
  const isMobile = useMediaQuery("(max-width: 639px)");
  const isSquished = useMediaQuery(
    "(min-width: 1024px) and (max-width: 1080px)",
  );
  const isCompact = isMobile || isSquished;
  const buttonConfig = isCompact ? BUTTON_CONFIG.icon : BUTTON_CONFIG.button;
  const scrollToSection = useScrollToSection();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = "auto";
    const timer = setTimeout(() => {
      document.documentElement.style.scrollBehavior = "smooth";
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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

        <div id="stack">
          <TechsContainer techs={techs} />
        </div>
      </div>

      <AnimatedSection
        animateOnMount={true}
        className="hidden lg:block self-center -mt-12"
      >
        <ScrollIndicator onClick={() => scrollToSection("projects")} />
      </AnimatedSection>

      <AnimatedSection id="projects">
        <ProjectsContainer />
      </AnimatedSection>
    </Container>
  );
}

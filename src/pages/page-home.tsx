import Button from "../components/button";
import Container from "../components/container";
import Text from "../components/text";
import TechsContainer from "../core-components/techs-container";
import ProjectsContainer from "../core-components/projects-container";
import About from "../core-components/about-container";
import ScrollIndicator from "../components/scroll-indicator";

import GitHubIcon from "../assets/icons/github.svg?react";
import LinkedInIcon from "../assets/icons/linkedin.svg?react";
import CVIcon from "../assets/icons/cv.svg?react";

import useScrollToSection from "../hooks/use-scroll-to-section.ts";
import useMediaQuery from "../hooks/use-media-query.ts";
import { motion, type Variants } from "framer-motion";
import AnimatedSection, {
  animationVariants,
} from "../components/animated-section.tsx";
import { useEffect } from "react";

const SOCIAL_LINKS = [
  {
    href: "https://github.com/M-its",
    icon: GitHubIcon,
    label: "GitHub",
  },
  {
    href: "https://www.linkedin.com/in/mitsrael-souza-410415162/",
    icon: LinkedInIcon,
    label: "LinkedIn",
  },
  {
    href: "../../public/resume.pdf",
    icon: CVIcon,
    label: "Resume",
    download: true,
  },
];

const BUTTON_CONFIG = {
  mobile: {
    mode: "icon" as const,
    iconVariant: "secondary" as const,
    size: "xl" as const,
  },
  desktop: {
    mode: "button" as const,
    iconVariant: "primary" as const,
    size: "md" as const,
  },
};

const buttonContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
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
  const isMobile = useMediaQuery("(max-width: 640px)");
  const scrollToSection = useScrollToSection();
  const buttonConfig = isMobile ? BUTTON_CONFIG.mobile : BUTTON_CONFIG.desktop;

  // Fix page scroll jump caused by whileInView from motion
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = "auto";

    const timer = setTimeout(() => {
      document.documentElement.style.scrollBehavior = "smooth";
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Container className="mt-46 md:mt-60 flex flex-col gap-16 md:gap-20">
      <AnimatedSection id="home" animateOnMount>
        <Text as="h1" variant="heading-hero" className="mb-2 tracking-wider">
          Mitsrael Souza
        </Text>
        <Text variant="subtitle">Full-Stack Developer</Text>

        <motion.div
          className="flex gap-6 mt-6 md:mt-12"
          variants={buttonContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {SOCIAL_LINKS.map(({ label, ...linkProps }) => (
            <motion.div key={label} variants={buttonVariants}>
              <Button as="a" target="_blank" {...buttonConfig} {...linkProps}>
                <span className="hidden sm:block">{label}</span>
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </AnimatedSection>

      <AnimatedSection id="about" delay={0.2}>
        <About />
      </AnimatedSection>

      <AnimatedSection
        variants={animationVariants.fadeDown}
        delay={0.6}
        as="div"
        viewport={{ once: true, margin: "-50px" }}
        repeatOnView
        className="sm:block hidden"
      >
        <ScrollIndicator onClick={() => scrollToSection("techs")} />
      </AnimatedSection>

      <AnimatedSection
        variants={animationVariants.blur}
        id="techs"
        repeatOnView
      >
        <TechsContainer />
      </AnimatedSection>

      <AnimatedSection id="projects" delay={0.2} repeatOnView>
        <ProjectsContainer />
      </AnimatedSection>
    </Container>
  );
}

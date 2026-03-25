import { motion, type Variants } from "framer-motion";
import type React from "react";
import useProjects from "../hooks/use-projects";
import ProjectCard from "./project-card";
import ProjectCardSkeleton from "./project-card-skeleton";
import AnimatedSection from "../components/animated-section";
import Text from "../components/text";

interface ProjectsContainerProps extends React.ComponentProps<"div"> {
  staggerDelay?: number;
  cardAnimationDuration?: number;
  viewportAmount?: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.3,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const SKELETON_COUNT = 4;
const SKELETON_IDS = Array.from(
  { length: SKELETON_COUNT },
  (_, i) => `skeleton-${i}`,
);

export default function ProjectsContainer({
  staggerDelay = 0.3,
  cardAnimationDuration = 0.5,
  viewportAmount = 0.1,
  className,
  ...props
}: ProjectsContainerProps) {
  const { projects, loading } = useProjects();

  const customContainerVariants: Variants = {
    ...containerVariants,
    visible: {
      ...containerVariants.visible,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.3,
      },
    },
  };

  const customCardVariants: Variants = {
    ...cardVariants,
    visible: {
      ...cardVariants.visible,
      transition: {
        duration: cardAnimationDuration,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <div className={className} {...props}>
      <AnimatedSection as="div" className="mb-12">
        <div className="flex items-center gap-4 opacity-70">
          <Text as="span" className="text-[13px] font-black tracking-[0.4em]">
            <span className="hidden lg:inline">02</span>
            <span className="lg:hidden">03</span>
          </Text>
          <div className="h-px w-10 bg-current" />
          <Text
            as="h2"
            variant="heading-section"
            className="font-bold uppercase tracking-[0.4em]"
          >
            Projetos
          </Text>
        </div>
      </AnimatedSection>

      <motion.div
        className="projects-grid"
        variants={customContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {loading
          ? SKELETON_IDS.map((id) => (
              <motion.div
                key={id}
                variants={customCardVariants}
                className="min-w-0 w-full shadow-2xl rounded-3xl"
              >
                <ProjectCardSkeleton />
              </motion.div>
            ))
          : projects.map((project) => (
              <motion.div
                key={project.repository}
                initial="hidden"
                animate="visible"
                variants={customCardVariants}
                className="min-w-0 w-full shadow-2xl rounded-3xl"
              >
                <ProjectCard
                  repository={project.repository}
                  name={project.name}
                  description={project.description || "Sem descrição"}
                  image={project.image}
                  languages={project.languages}
                  github_repo={project.github_repo}
                  homepage={project.homepage}
                />
              </motion.div>
            ))}
      </motion.div>
    </div>
  );
}

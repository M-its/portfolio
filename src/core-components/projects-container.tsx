import { motion, type Variants } from "framer-motion";
import type React from "react";
import useProjects from "../hooks/use-projects";
import ProjectCard from "./project-card";
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
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
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

export default function ProjectsContainer({
  staggerDelay = 0.3,
  cardAnimationDuration = 0.5,
  viewportAmount = 0.1,
  className,
  ...props
}: ProjectsContainerProps) {
  const { projects, loading } = useProjects();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Text variant="heading-section" className="opacity-70">
          Carregando projetos...
        </Text>
      </div>
    );
  }

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
      <Text as="h2" variant="heading-section" className="mb-10 tracking-wider">
        Projects
      </Text>
      <motion.div
        className="projects-grid"
        variants={customContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: viewportAmount }}
      >
        {projects.map((project) => (
          <motion.div
            key={project.repository}
            variants={customCardVariants}
            className="min-w-0 w-full"
          >
            <ProjectCard
              repository={project.repository}
              description={project.description || "Sem descrição"}
              image={project.image}
              languages={project.languages}
              github_repo={project.github_repo}
              homepage={project.homepage}
              featured={project.featured}
              className="hover:border-btn-primary-bg-hover"
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

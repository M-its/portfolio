import { motion, type Variants } from "framer-motion";
import { techs } from "../data/techs";
import Text from "../components/text";
import TechCard from "./tech-card";
import Container from "../components/container";

const CATEGORY_MAP = {
  frontend: [
    "React",
    "Axios",
    "React Router",
    "Next",
    "HTML",
    "CSS",
    "Tailwind",
    "Vite",
    "Sass",
    "Styled Components",
  ],
  languages: ["TypeScript", "JavaScript"],
  backend: [
    "Node.js",
    "Express",
    "Fastify",
    "FastAPI",
    "JWT",
    "Swagger",
    "Dotenv",
  ],
  database: ["SQL", "SQLite", "Knex.js"],
  tools: ["Git", "GitHub", "Jest", "Vitest", "Zod", "Swiper"],
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.1 } },
};

const BentoCard = ({
  title,
  children,
  className = "",
}: { title: string; children: React.ReactNode; className?: string }) => (
  <Container
    className={`relative mx-0 overflow-hidden rounded-2xl border border-card-border-variant bg-card-bg p-5 ${className}`}
  >
    <Text
      as="h3"
      className="mb-5 text-[12px] uppercase tracking-[0.2em] font-bold"
    >
      {title}
    </Text>
    {children}
  </Container>
);

export default function Techs() {
  const getTechsByNames = (names: string[]) =>
    techs.filter((t) => names.includes(t.name));

  return (
    <div className="w-full max-w-7xl mx-auto">
      <Text as="h2" variant="heading-section" className="mb-10">
        Tech Stack
      </Text>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-12 gap-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
      >
        {/* Frontend */}
        <BentoCard title="Frontend & Core" className="md:col-span-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              ...getTechsByNames(CATEGORY_MAP.languages),
              ...getTechsByNames(CATEGORY_MAP.frontend),
            ].map((t) => (
              <motion.div key={t.name} variants={itemVariants} className="h-20">
                <TechCard tech={t} size="sm" />
              </motion.div>
            ))}
          </div>
        </BentoCard>

        {/* Backend */}
        <BentoCard title="Backend & APIs" className="md:col-span-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {getTechsByNames(CATEGORY_MAP.backend).map((t) => (
              <motion.div key={t.name} variants={itemVariants} className="h-20">
                <TechCard tech={t} size="sm" />
              </motion.div>
            ))}
          </div>
        </BentoCard>

        {/* Database */}
        <BentoCard title="Database" className="md:col-span-4">
          <div className="grid grid-cols-2 gap-3">
            {getTechsByNames(CATEGORY_MAP.database).map((t) => (
              <motion.div key={t.name} variants={itemVariants} className="h-20">
                <TechCard tech={t} size="sm" />
              </motion.div>
            ))}
          </div>
        </BentoCard>

        {/* Tools */}
        <BentoCard title="Tools & Testing" className="md:col-span-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {getTechsByNames(CATEGORY_MAP.tools).map((t) => (
              <motion.div key={t.name} variants={itemVariants} className="h-20">
                <TechCard tech={t} size="sm" />
              </motion.div>
            ))}
          </div>
        </BentoCard>
      </motion.div>
    </div>
  );
}

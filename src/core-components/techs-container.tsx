import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import TechCard from "./tech-card";
import Text from "../components/text";
import type { techs as techsData } from "../data/techs";
import AnimatedSection from "../components/animated-section";
import { useTheme } from "../contexts/theme-context";

const CATEGORIES = [
  {
    id: "frontend",
    title: "Frontend & Interface",
    keys: ["React", "Next", "TypeScript", "Tailwind", "Vite", "React Router"],
  },
  {
    id: "backend",
    title: "Backend & APIs",
    keys: ["Node", "Express", "Fastify", "Postgre SQL", "Zod", "JWT"],
  },
  {
    id: "tools",
    title: "Tools & DevOps",
    keys: ["Git", "GitHub", "Docker", "Vitest", "Jest", "Swagger"],
  },
];

type TechItem = (typeof techsData)[0];

export default function TechsContainer({ techs }: { techs: TechItem[] }) {
  const { isDark } = useTheme();
  const getTechs = (keys: string[]) =>
    techs.filter((t) => keys.includes(t.name));

  return (
    <div className="w-full min-w-0 h-full flex flex-col">
      <AnimatedSection className="lg:hidden">
        <div className="flex items-center gap-4 opacity-70 mb-10">
          <Text as="span" className="text-[13px] font-black tracking-[0.4em]">
            02
          </Text>
          <div className="h-px w-10 bg-current" />
          <Text
            as="h2"
            variant="heading-section"
            className="font-bold uppercase tracking-[0.4em]"
          >
            Stack
          </Text>
        </div>
      </AnimatedSection>
      <AnimatedSection
        delay={0.3}
        className={`w-full min-w-0 rounded-3xl shadow-2xl flex-1 ${isDark ? "bg-white/2 border-btn-primary-bg-hover" : "bg-white/50 border-btn-primary-bg-hover/50"} border`}
      >
        <div className="p-8 rounded-3xl overflow-hidden h-full">
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            autoplay={{
              delay: 5000,
              disableOnInteraction: true,
              pauseOnMouseEnter: true,
            }}
            pagination={{ clickable: true }}
            className="w-full h-full tech-swiper pb-8"
          >
            {CATEGORIES.map((cat) => (
              <SwiperSlide key={cat.id} className="h-full">
                <div className="flex flex-col gap-6 pb-2 h-full">
                  <Text
                    as="h3"
                    className="text-xs uppercase tracking-[0.4em] opacity-40 font-bold border-b border-card-border/50 pb-3"
                  >
                    {cat.title}
                  </Text>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4 flex-1">
                    {getTechs(cat.keys).map((t) => (
                      <TechCard
                        key={t.name}
                        tech={t}
                        size="lg"
                        className="min-h-28"
                      />
                    ))}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </AnimatedSection>
    </div>
  );
}

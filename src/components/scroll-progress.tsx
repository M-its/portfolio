import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 34,
    mass: 0.25,
  });

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] bg-scroll-progress-track"
      aria-hidden="true"
    >
      <motion.div
        className="h-full origin-left bg-scroll-progress"
        style={{ scaleX: progress }}
      />
    </div>
  );
}

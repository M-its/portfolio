import { memo, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Icon from "../components/icon";
import LogoIcon from "../assets/images/logo-plain.svg?react";
import useMediaQuery from "../hooks/use-media-query";

interface IntroSplashSimpleProps {
  onFinish: () => void;
  duration?: number;
}

const Particles = memo(() => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const count = isMobile ? 20 : 60;
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 2 + 2,
      delay: Math.random() * 2,
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-text-primary"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -40],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
});

Particles.displayName = "Particles";

export default function IntroSplashSimple({
  onFinish,
  duration = 2,
}: IntroSplashSimpleProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(onFinish, duration * 1000);
    return () => clearTimeout(timer);
  }, [onFinish, duration]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-background overflow-hidden"
    >
      <Particles />

      {/* Moldura de Cantos - Linhas mais finas */}
      <div className="absolute inset-8 pointer-events-none">
        <div className="absolute top-0 left-0 w-6 h-[0.5px] bg-text-primary/20" />
        <div className="absolute top-0 left-0 w-[0.5px] h-6 bg-text-primary/20" />
        <div className="absolute bottom-0 right-0 w-6 h-[0.5px] bg-text-primary/20" />
        <div className="absolute bottom-0 right-0 w-[0.5px] h-6 bg-text-primary/20" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6"
        >
          <Icon
            svg={LogoIcon}
            className="fill-text-primary w-10 h-10 opacity-90"
          />
        </motion.div>

        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "circOut" }}
            className="text-text-primary font-light text-xl md:text-2xl tracking-[0.5em] uppercase"
          >
            Mitsrael Souza
          </motion.h1>
        </div>

        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "40px", opacity: 0.4 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="h-px bg-text-primary my-4"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-text-primary text-[9px] tracking-[0.6em] uppercase font-medium"
        >
          Portfolio 2026
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="absolute right-12 bottom-12 flex flex-col items-center text-[8px] tracking-tighter uppercase font-bold text-text-primary"
      >
        {"DIGITAL".split("").map((char, i) => (
          <span
            key={`d-${
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              i
            }`}
            className="leading-tight"
          >
            {char}
          </span>
        ))}
        <div className="h-3" />
        {"EXPERIENCE".split("").map((char, i) => (
          <span
            key={`e-${
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              i
            }`}
            className="leading-tight"
          >
            {char}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}

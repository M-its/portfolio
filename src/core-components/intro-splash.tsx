import { memo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Icon from "../components/icon";
import LogoIcon from "../assets/images/logo-plain.svg?react";
import useMediaQuery from "../hooks/use-media-query";

// ─── Particles
const Particles = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const count = isMobile ? 20 : 60;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.4 + 0.2,
      opacity: 0,
      opSpeed: Math.random() * 0.015 + 0.005,
      phase: Math.random() * Math.PI * 2,
    }));

    let rafId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.phase += p.opSpeed;
        p.opacity = ((Math.sin(p.phase) + 1) / 2) * 0.8;
        p.y -= p.speed;

        if (p.y < -p.size) {
          p.y = canvas.height + p.size;
          p.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.3})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [isMobile]);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
  );
});

Particles.displayName = "Particles";

// ─── Corner frames
function CornerFrames() {
  return (
    <div className="absolute inset-8 pointer-events-none">
      <div className="absolute top-0 left-0 w-6 h-[0.5px] bg-text-primary/20" />
      <div className="absolute top-0 left-0 w-[0.5px] h-6 bg-text-primary/20" />
      <div className="absolute bottom-0 right-0 w-6 h-[0.5px] bg-text-primary/20" />
      <div className="absolute bottom-0 right-0 w-[0.5px] h-6 bg-text-primary/20" />
    </div>
  );
}

// ─── Vertical text
function VerticalText() {
  return (
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
  );
}

// ─── Content
function SplashContent() {
  return (
    <div className="relative z-10 flex flex-col items-center">
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
        Portfólio 2026
      </motion.p>
    </div>
  );
}

// ─── IntroSplash
interface IntroSplashProps {
  onFinish: () => void;
  duration?: number;
}

export default function IntroSplash({
  onFinish,
  duration = 2,
}: IntroSplashProps) {
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
      <CornerFrames />
      <SplashContent />
      <VerticalText />
    </motion.div>
  );
}

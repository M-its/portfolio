import { useEffect, useRef, useState, type FC } from "react";
import useCustomCursor from "../hooks/use-custom-cursor";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const CustomCursor: FC = () => {
  const innerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const { isUnsupported } = useCustomCursor();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
  );
  const [isHovering, setIsHovering] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Respeita mudanças de preferência do sistema
  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (isUnsupported || prefersReducedMotion) return;

    const inner = innerRef.current;
    const outer = outerRef.current;
    if (!inner || !outer) return;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const dot = { x: pos.x, y: pos.y };
    const circle = { x: pos.x, y: pos.y };
    let rafId: number;

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    const handleMouseMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;

      const target = e.target as Element;
      const interactive = target.closest(
        "a, button, input, select, textarea, [data-cursor-clickable], [role='button']",
      );
      setIsHovering(!!interactive);

      // Reinicia o loop se ele tiver parado
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(animate);
    };

    const handleMouseLeave = () => {
      if (inner) inner.style.opacity = "0";
      if (outer) outer.style.opacity = "0";
    };

    const handleMouseEnter = () => {
      if (inner) inner.style.opacity = "1";
      if (outer) outer.style.opacity = "1";
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    const animate = () => {
      dot.x = lerp(dot.x, pos.x, 0.3);
      dot.y = lerp(dot.y, pos.y, 0.3);
      circle.x = lerp(circle.x, pos.x, 0.15);
      circle.y = lerp(circle.y, pos.y, 0.15);

      if (inner)
        inner.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0)`;
      if (outer)
        outer.style.transform = `translate3d(${circle.x}px, ${circle.y}px, 0)`;

      const deltaX = Math.abs(pos.x - circle.x);
      const deltaY = Math.abs(pos.y - circle.y);

      // Só continua o loop se ainda houver movimento visível
      if (deltaX > 0.1 || deltaY > 0.1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(rafId);
    };
  }, [isUnsupported, prefersReducedMotion]);

  // Esconde o cursor nativo apenas quando o custom cursor está ativo
  useEffect(() => {
    const shouldHide = !isUnsupported && !prefersReducedMotion;
    document.documentElement.style.cursor = shouldHide ? "none" : "auto";
    return () => {
      document.documentElement.style.cursor = "auto";
    };
  }, [isUnsupported, prefersReducedMotion]);

  if (isUnsupported || prefersReducedMotion) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-9999 overflow-hidden mix-blend-difference"
      aria-hidden="true"
    >
      <div
        ref={innerRef}
        className="absolute top-0 left-0 w-1.5 h-1.5 rounded-full bg-white will-change-transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
      />
      <div
        ref={outerRef}
        className={`absolute top-0 left-0 rounded-full border border-white will-change-transform transition-all duration-300 ease-out -translate-x-1/2 -translate-y-1/2 ${
          isHovering
            ? isClicked
              ? "w-8 h-8 border-2"
              : "w-12 h-12 border"
            : isClicked
              ? "w-4 h-4 border-2"
              : "w-8 h-8 border"
        }`}
      />
    </div>
  );
};

export default CustomCursor;

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
  const [isOverField, setIsOverField] = useState(false);
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
    let isHidden = false;
    let isAnimating = true;
    let lastTarget: Element | null = null;
    let lastHoverState = false;
    let lastFieldState = false;

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

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
      } else {
        isAnimating = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Força a exibição do cursor caso ele tenha sido ocultado pelo mouseleave/mouseout
      if (isHidden) {
        isHidden = false;
        if (inner) inner.style.opacity = "1";
        if (outer) outer.style.opacity = "1";
      }

      pos.x = e.clientX;
      pos.y = e.clientY;

      const target = e.target as Element;
      // Cache de alvo minimiza chamadas caras de reflow/DOM parsing nos cards
      if (target !== lastTarget) {
        lastTarget = target;
        const interactive = !!target.closest(
          "a, button, input, select, textarea, [data-cursor-clickable], [role='button']",
        );
        const overField = !!target.closest("input, select, textarea");

        if (interactive !== lastHoverState) {
          lastHoverState = interactive;
          setIsHovering(interactive);
        }
        if (overField !== lastFieldState) {
          lastFieldState = overField;
          setIsOverField(overField);
        }
      }

      // Reinicia o loop de animação de forma segura sem cancelar frames em andamento
      if (!isAnimating) {
        isAnimating = true;
        rafId = requestAnimationFrame(animate);
      }
    };

    const handleMouseLeave = (e: Event) => {
      // No Firefox, "mouseout" com relatedTarget nulo indica que o mouse saiu da janela.
      if (
        e.type === "mouseleave" ||
        (e.type === "mouseout" && (e as MouseEvent).relatedTarget === null)
      ) {
        isHidden = true;
        if (inner) inner.style.opacity = "0";
        if (outer) outer.style.opacity = "0";
      }
    };

    const handleMouseEnter = () => {
      isHidden = false;
      if (inner) inner.style.opacity = "1";
      if (outer) outer.style.opacity = "1";
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button === 0) setIsClicked(true);
    };
    const handlePointerUp = () => setIsClicked(false);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("pointerup", handlePointerUp, true);
    document.addEventListener("pointercancel", handlePointerUp, true);
    window.addEventListener("blur", handlePointerUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseout", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("pointerup", handlePointerUp, true);
      document.removeEventListener("pointercancel", handlePointerUp, true);
      window.removeEventListener("blur", handlePointerUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseout", handleMouseLeave);
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
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden mix-blend-difference"
      aria-hidden="true"
    >
      <div
        ref={innerRef}
        className={`absolute top-0 left-0 rounded-full bg-cursor-contrast will-change-transform -translate-x-1/2 -translate-y-1/2 transition-[width,height,opacity] duration-300 ${
          isHovering ? "h-1 w-1 opacity-55" : "h-1.5 w-1.5 opacity-100"
        }`}
      />
      <div
        ref={outerRef}
        className={`absolute top-0 left-0 rounded-full border border-cursor-contrast will-change-transform transition-[width,height,border-width,background-color,opacity] duration-300 ease-out -translate-x-1/2 -translate-y-1/2 ${
          isHovering
            ? isClicked
              ? "w-9 h-9 border-2 bg-cursor-fill"
              : isOverField
                ? "w-10 h-10 border bg-cursor-fill opacity-80"
                : "w-12 h-12 border bg-cursor-fill"
            : isClicked
              ? "w-4 h-4 border-2"
              : "w-8 h-8 border bg-transparent opacity-80"
        }`}
      />
    </div>
  );
};

export default CustomCursor;

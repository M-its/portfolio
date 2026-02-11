import { useEffect, useRef, useState, type FC } from "react";
import useBrowserFeatures from "../hooks/use-browser-features";
import { useTheme } from "../contexts/theme-context";

const CustomCursor: FC = () => {
  const innerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const { isUnsupported } = useBrowserFeatures();

  const { isDark } = useTheme();

  const [isHovering, setIsHovering] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    if (isUnsupported) return;

    const inner = innerRef.current;
    const outer = outerRef.current;
    if (!inner || !outer) return;

    const pos = { x: 0, y: 0 };
    const dot = { x: 0, y: 0 };
    const circle = { x: 0, y: 0 };
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

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      cancelAnimationFrame(rafId);
    };
  }, [isUnsupported]);

  if (isUnsupported) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-10000 overflow-hidden">
      <div
        ref={innerRef}
        className={`absolute top-0 left-0 w-1.5 h-1.5 rounded-full transition-colors duration-300 will-change-transform -translate-x-1/2 -translate-y-1/2 ${isDark ? "bg-white" : "bg-btn-primary-bg"}`}
      />
      <div
        ref={outerRef}
        className={`absolute top-0 left-0 rounded-full border transition-all duration-300 ease-out will-change-transform -translate-x-1/2 -translate-y-1/2 ${
          isDark ? "border-white" : "border-btn-primary-bg"
        } ${
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

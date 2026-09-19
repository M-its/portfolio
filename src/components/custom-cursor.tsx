import { useEffect, useRef, useState, type FC } from "react";
import useCustomCursor from "../hooks/use-custom-cursor";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const INTERACTIVE_SELECTOR =
  "a, button, input, select, textarea, [data-cursor-clickable], [role='button']";
const FIELD_SELECTOR = "input, select, textarea";

type CursorState =
  | "idle"
  | "idle-pressed"
  | "interactive"
  | "field"
  | "pressed";

const CustomCursor: FC = () => {
  const innerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const { isUnsupported } = useCustomCursor();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY);
    const handler = (event: MediaQueryListEvent) =>
      setPrefersReducedMotion(event.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (isUnsupported || prefersReducedMotion) return;

    const inner = innerRef.current;
    const outer = outerRef.current;
    if (!inner || !outer) return;

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const dot = { ...pointer };
    const ring = { ...pointer };
    let frameId = 0;
    let isHidden = true;
    let isPressed = false;
    let visualState: CursorState | null = null;

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    const resolveState = (): CursorState => {
      const target = document.elementFromPoint(pointer.x, pointer.y);
      const ignored = target?.closest("[data-cursor-ignore]");
      if (!target || ignored) return isPressed ? "idle-pressed" : "idle";

      const interactive = target.closest(INTERACTIVE_SELECTOR);
      if (!interactive) return isPressed ? "idle-pressed" : "idle";
      if (isPressed) return "pressed";
      return target.closest(FIELD_SELECTOR) ? "field" : "interactive";
    };

    const renderState = (state: CursorState) => {
      if (state === visualState) return;
      visualState = state;

      const interactive =
        state === "interactive" || state === "field" || state === "pressed";
      const size =
        state === "interactive"
          ? 56
          : state === "field"
            ? 48
            : state === "pressed"
              ? 40
              : state === "idle-pressed"
                ? 24
                : 40;

      inner.style.width = interactive ? "4px" : "6px";
      inner.style.height = interactive ? "4px" : "6px";
      inner.style.opacity = isHidden ? "0" : interactive ? "0.55" : "1";

      outer.style.width = `${size}px`;
      outer.style.height = `${size}px`;
      outer.style.borderWidth = state.includes("pressed") ? "2px" : "1px";
      outer.style.backgroundColor = interactive
        ? "var(--color-cursor-fill)"
        : "transparent";
      outer.style.opacity = isHidden ? "0" : state === "field" ? "0.8" : "1";
    };

    const animate = () => {
      dot.x = lerp(dot.x, pointer.x, 0.3);
      dot.y = lerp(dot.y, pointer.y, 0.3);
      ring.x = lerp(ring.x, pointer.x, 0.15);
      ring.y = lerp(ring.y, pointer.y, 0.15);

      inner.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0)`;
      outer.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      renderState(resolveState());
      frameId = requestAnimationFrame(animate);
    };

    const showAtPointer = (event: MouseEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (isHidden) {
        isHidden = false;
        visualState = null;
      }
    };

    const hide = () => {
      isHidden = true;
      isPressed = false;
      visualState = null;
    };

    const press = (event: PointerEvent) => {
      if (event.button !== 0) return;
      isPressed = true;
      visualState = null;
    };

    const release = () => {
      isPressed = false;
      visualState = null;
    };

    window.addEventListener("mousemove", showAtPointer, { passive: true });
    document.addEventListener("pointerdown", press, true);
    document.addEventListener("pointerup", release, true);
    document.addEventListener("pointercancel", release, true);
    window.addEventListener("blur", release);
    document.addEventListener("mouseleave", hide);
    frameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", showAtPointer);
      document.removeEventListener("pointerdown", press, true);
      document.removeEventListener("pointerup", release, true);
      document.removeEventListener("pointercancel", release, true);
      window.removeEventListener("blur", release);
      document.removeEventListener("mouseleave", hide);
      cancelAnimationFrame(frameId);
    };
  }, [isUnsupported, prefersReducedMotion]);

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
        className="absolute top-0 left-0 h-1.5 w-1.5 rounded-full bg-cursor-contrast opacity-0 will-change-transform -translate-x-1/2 -translate-y-1/2 transition-[width,height,opacity] duration-200"
      />
      <div
        ref={outerRef}
        className="absolute top-0 left-0 h-10 w-10 rounded-full border border-cursor-contrast bg-transparent opacity-0 will-change-transform -translate-x-1/2 -translate-y-1/2 transition-[width,height,border-width,background-color,opacity] duration-200 ease-out"
      />
    </div>
  );
};

export default CustomCursor;

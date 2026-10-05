import { useEffect, useRef, useState, type FC } from "react";
import { createPortal } from "react-dom";
import useCustomCursor from "../hooks/use-custom-cursor";
import {
  cancelVisualUpdate,
  scheduleVisualUpdate,
} from "../utils/visual-frame";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const INTERACTIVE_SELECTOR =
  "a, button, input, select, textarea, [data-cursor-clickable], [role='button']";
const FIELD_SELECTOR = "input, select, textarea";

type CursorState =
  | "idle"
  | "idle-pressed"
  | "interactive"
  | "field"
  | "disabled"
  | "native"
  | "pressed";

const CustomCursor: FC = () => {
  const innerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const dotVisualRef = useRef<HTMLDivElement>(null);
  const ringVisualRef = useRef<SVGSVGElement>(null);
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
    const dotVisual = dotVisualRef.current;
    const ringVisual = ringVisualRef.current;
    if (!inner || !outer || !dotVisual || !ringVisual) return;

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { ...pointer };
    let isHidden = true;
    let isPressed = false;
    let visualState: CursorState | null = null;
    let needsHitTest = false;

    const resolveState = (): CursorState => {
      const target = document.elementFromPoint(pointer.x, pointer.y);
      const ignored = target?.closest("[data-cursor-ignore]");
      if (target?.closest("iframe, [data-cursor-native]")) return "native";
      if (!target || ignored) return isPressed ? "idle-pressed" : "idle";

      const interactive = target.closest(INTERACTIVE_SELECTOR);
      if (!interactive) return isPressed ? "idle-pressed" : "idle";
      if (interactive.matches(":disabled, [aria-disabled='true']")) {
        return "disabled";
      }
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
                : state === "disabled"
                  ? 28
                  : 40;
      const hidden = isHidden || state === "native";

      dotVisual.style.transform = `scale(${interactive ? 2 / 3 : 1})`;
      inner.style.opacity = hidden ? "0" : interactive ? "0.55" : "1";

      const strokeWidth = state.includes("pressed") ? 2 : 1;
      // A fixed 56px SVG scales without layout; its stroke stays 1px/2px on screen.
      ringVisual.style.transform = `scale(${(size - strokeWidth) / 55})`;
      ringVisual.style.strokeWidth = `${strokeWidth}px`;
      ringVisual.style.fill = interactive
        ? "var(--color-cursor-fill)"
        : "transparent";
      outer.style.opacity = hidden
        ? "0"
        : state === "disabled"
          ? "0.45"
          : state === "field"
            ? "0.8"
            : "1";
    };

    const refreshState = () => {
      if (!isHidden) needsHitTest = true;
    };

    const prepareFrame = () => {
      if (isHidden) return;
      const state = needsHitTest ? resolveState() : null;
      needsHitTest = false;
      return () => {
        if (state) renderState(state);
        ring.x += (pointer.x - ring.x) * 0.15;
        ring.y += (pointer.y - ring.y) * 0.15;
        inner.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;
        outer.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
        if (Math.hypot(pointer.x - ring.x, pointer.y - ring.y) > 0.1) {
          scheduleVisualUpdate(prepareFrame);
        }
      };
    };

    const scheduleRefresh = () => {
      refreshState();
      if (!isHidden) scheduleVisualUpdate(prepareFrame);
    };

    const showAtPointer = (event: MouseEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (isHidden) {
        ring.x = pointer.x;
        ring.y = pointer.y;
        isHidden = false;
        visualState = null;
      }
      scheduleRefresh();
      if (
        !document.documentElement.classList.contains("custom-cursor-active")
      ) {
        document.documentElement.classList.add("custom-cursor-active");
      }
    };

    const hide = () => {
      isHidden = true;
      isPressed = false;
      visualState = null;
      cancelVisualUpdate(prepareFrame);
      renderState("idle");
      document.documentElement.classList.remove("custom-cursor-active");
    };

    const press = (event: PointerEvent) => {
      if (event.button !== 0) return;
      isPressed = true;
      scheduleRefresh();
    };

    const release = () => {
      isPressed = false;
      scheduleRefresh();
    };

    // UI changes can alter the hovered control even when the mouse stays still.
    const observer = new MutationObserver(scheduleRefresh);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["disabled", "aria-disabled", "inert"],
    });

    window.addEventListener("mousemove", showAtPointer, { passive: true });
    document.addEventListener("mouseover", showAtPointer, { passive: true });
    document.addEventListener("pointerdown", press, true);
    document.addEventListener("pointerup", release, true);
    document.addEventListener("pointercancel", release, true);
    window.addEventListener("blur", hide);
    document.addEventListener("mouseleave", hide);
    document.addEventListener("scroll", scheduleRefresh, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", scheduleRefresh, { passive: true });

    return () => {
      window.removeEventListener("mousemove", showAtPointer);
      document.removeEventListener("mouseover", showAtPointer);
      document.removeEventListener("pointerdown", press, true);
      document.removeEventListener("pointerup", release, true);
      document.removeEventListener("pointercancel", release, true);
      window.removeEventListener("blur", hide);
      document.removeEventListener("mouseleave", hide);
      document.removeEventListener("scroll", scheduleRefresh, true);
      window.removeEventListener("resize", scheduleRefresh);
      observer.disconnect();
      cancelVisualUpdate(prepareFrame);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [isUnsupported, prefersReducedMotion]);

  if (isUnsupported || prefersReducedMotion) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden mix-blend-difference"
      aria-hidden="true"
    >
      <div
        ref={innerRef}
        className="absolute top-0 left-0 h-1.5 w-1.5 opacity-0 will-change-transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200"
      >
        <div
          ref={dotVisualRef}
          className="h-full w-full rounded-full bg-cursor-contrast transition-transform duration-200"
        />
      </div>
      <div
        ref={outerRef}
        className="absolute top-0 left-0 h-14 w-14 opacity-0 will-change-transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 ease-out"
      >
        <svg
          aria-hidden="true"
          ref={ringVisualRef}
          viewBox="0 0 56 56"
          className="h-full w-full overflow-visible fill-transparent stroke-cursor-contrast transition-[transform,stroke-width,fill] duration-200 ease-out"
          style={{ transform: "scale(0.7090909090909091)", strokeWidth: "1px" }}
        >
          <circle cx="28" cy="28" r="27.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </div>,
    document.body,
  );
};

export default CustomCursor;

import { useEffect } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

function shouldUseNativeScroll(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        "[data-native-scroll], textarea, input, select, [contenteditable='true']",
      ),
    )
  );
}

export default function SmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
    const finePointer = window.matchMedia(FINE_POINTER_QUERY);
    let frameId = 0;
    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let isAnimating = false;

    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const clamp = (value: number) => Math.min(maxScroll(), Math.max(0, value));

    const animate = () => {
      const distance = targetY - currentY;
      currentY += distance * 0.1;

      if (Math.abs(distance) < 0.25) {
        currentY = targetY;
        isAnimating = false;
        window.scrollTo(0, currentY);
        return;
      }

      window.scrollTo(0, currentY);
      frameId = window.requestAnimationFrame(animate);
    };

    const handleWheel = (event: WheelEvent) => {
      if (
        reducedMotion.matches ||
        !finePointer.matches ||
        event.ctrlKey ||
        shouldUseNativeScroll(event.target)
      ) {
        return;
      }

      event.preventDefault();
      const multiplier =
        event.deltaMode === 1
          ? 18
          : event.deltaMode === 2
            ? window.innerHeight
            : 1;
      targetY = clamp(targetY + event.deltaY * multiplier);

      if (!isAnimating) {
        currentY = window.scrollY;
        isAnimating = true;
        frameId = window.requestAnimationFrame(animate);
      }
    };

    const syncPosition = () => {
      if (!isAnimating) {
        targetY = window.scrollY;
        currentY = window.scrollY;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", syncPosition, { passive: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", syncPosition);
    };
  }, []);

  return null;
}

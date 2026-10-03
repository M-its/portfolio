import { useEffect } from "react";
import {
  MOBILE_MENU_STATE_EVENT,
  type MobileMenuStateDetail,
} from "../utils/ui-events";

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
    let isScrollLocked = false;

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
      if (isScrollLocked) {
        event.preventDefault();
        return;
      }

      const nativeScrollTarget = shouldUseNativeScroll(event.target);

      if (
        reducedMotion.matches ||
        !finePointer.matches ||
        event.ctrlKey ||
        nativeScrollTarget
      ) {
        if (nativeScrollTarget && isAnimating) {
          window.cancelAnimationFrame(frameId);
          isAnimating = false;
          targetY = window.scrollY;
          currentY = window.scrollY;
        }
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

    const handleMobileMenuState = (event: Event) => {
      const { open } = (event as CustomEvent<MobileMenuStateDetail>).detail;
      isScrollLocked = open;

      if (!open) {
        targetY = window.scrollY;
        currentY = window.scrollY;
        return;
      }

      window.cancelAnimationFrame(frameId);
      isAnimating = false;
      targetY = window.scrollY;
      currentY = window.scrollY;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", syncPosition, { passive: true });
    window.addEventListener(MOBILE_MENU_STATE_EVENT, handleMobileMenuState);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", syncPosition);
      window.removeEventListener(
        MOBILE_MENU_STATE_EVENT,
        handleMobileMenuState,
      );
    };
  }, []);

  return null;
}

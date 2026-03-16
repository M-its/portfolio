import { useEffect, useState } from "react";

function detectUnsupported(threshold: number): boolean {
  const widthDiff = Math.abs(window.outerWidth - window.innerWidth);
  const heightDiff = Math.abs(window.outerHeight - window.innerHeight);
  const isDevToolsOpen = widthDiff > threshold || heightDiff > threshold;

  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);

  return isDevToolsOpen || hasTouch || isMobile;
}

export default function useCustomCursor(threshold = 160) {
  const [isUnsupported, setIsUnsupported] = useState(() =>
    detectUnsupported(threshold),
  );

  useEffect(() => {
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);

    if (hasTouch || isMobile) {
      setIsUnsupported(true);
      return;
    }

    const observer = new ResizeObserver(() => {
      setIsUnsupported(detectUnsupported(threshold));
    });

    observer.observe(document.documentElement);

    return () => observer.disconnect();
  }, [threshold]);

  return { isUnsupported };
}

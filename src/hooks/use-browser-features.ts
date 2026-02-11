import { useEffect, useState } from "react";

export default function useBrowserFeatures(threshold = 160, interval = 500) {
  const [isUnsupported, setIsUnsupported] = useState(false);

  useEffect(() => {
    const checkOnce = () => {
      const widthDiff = Math.abs(window.outerWidth - window.innerWidth);
      const heightDiff = Math.abs(window.outerHeight - window.innerHeight);
      const isDevToolsOpen = widthDiff > threshold || heightDiff > threshold;
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const userAgent = navigator.userAgent;
      const isMobile = /Mobi|Android|iPhone/i.test(userAgent);

      const detected = isDevToolsOpen || hasTouch || isMobile;

      setIsUnsupported((prev) => {
        if (prev !== detected) return detected;
        return prev;
      });
    };

    const id = setInterval(checkOnce, interval);
    return () => clearInterval(id);
  }, [threshold, interval]);

  return { isUnsupported };
}

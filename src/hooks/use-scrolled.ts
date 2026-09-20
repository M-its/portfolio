import { useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useState } from "react";

export const SCROLL_POSITION_SYNC_EVENT = "portfolio:scroll-position-sync";

export default function useScrolled(enterLimit = 50, exitLimit = enterLimit) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const syncWithWindow = () =>
      setScrolled((current) =>
        current ? window.scrollY > exitLimit : window.scrollY > enterLimit,
      );

    window.addEventListener(SCROLL_POSITION_SYNC_EVENT, syncWithWindow);
    return () =>
      window.removeEventListener(SCROLL_POSITION_SYNC_EVENT, syncWithWindow);
  }, [enterLimit, exitLimit]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled((current) => {
      const next = current ? latest > exitLimit : latest > enterLimit;
      return current === next ? current : next;
    });
  });

  return scrolled;
}

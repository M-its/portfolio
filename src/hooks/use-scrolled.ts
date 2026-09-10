import { useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useState } from "react";

export const SCROLL_POSITION_SYNC_EVENT = "portfolio:scroll-position-sync";

export default function useScrolled(limit = 50) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const syncWithWindow = () => setScrolled(window.scrollY > limit);

    window.addEventListener(SCROLL_POSITION_SYNC_EVENT, syncWithWindow);
    return () =>
      window.removeEventListener(SCROLL_POSITION_SYNC_EVENT, syncWithWindow);
  }, [limit]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const isOverLimit = latest > limit;
    setScrolled((current) => (current === isOverLimit ? current : isOverLimit));
  });

  return scrolled;
}

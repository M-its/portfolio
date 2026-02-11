import { useScroll } from "framer-motion";
import { useEffect, useState } from "react";

export default function useScrolled(limit = 50) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const unsub = scrollY.on("change", (y) => setScrolled(y > limit));
    return () => unsub();
  }, [scrollY, limit]);

  return scrolled;
}

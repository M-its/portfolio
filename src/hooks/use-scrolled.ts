import { useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";

export default function useScrolled(limit = 50) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const isOverLimit = latest > limit;
    if (isOverLimit !== scrolled) {
      setScrolled(isOverLimit);
    }
  });

  return scrolled;
}

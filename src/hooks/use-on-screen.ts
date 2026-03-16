import { useEffect, useRef, useState, type RefObject } from "react";

interface UseOnScreenOptions extends IntersectionObserverInit {
  triggerOnce?: boolean;
}

export function useOnScreen({
  triggerOnce = true,
  threshold = 0,
  root = null,
  rootMargin = "0px",
}: UseOnScreenOptions = {}): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, root, rootMargin },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, root, rootMargin, triggerOnce]);

  return [ref, isVisible];
}

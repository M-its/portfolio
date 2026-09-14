import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type RefObject,
  type ReactNode,
} from "react";
import useMediaQuery from "./use-media-query";

type MouseHandler = (x: number, y: number) => undefined | (() => void);

interface MouseGlareContextType {
  register: (handler: MouseHandler) => void;
  unregister: (handler: MouseHandler) => void;
}

const MouseGlareContext = createContext<MouseGlareContextType | null>(null);
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function MouseGlareProvider({ children }: { children: ReactNode }) {
  const handlers = useRef<Set<MouseHandler>>(new Set());
  const isMobile = useMediaQuery("(hover: none) and (pointer: coarse)");
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const isChromium = !!(window as unknown as { chrome: unknown }).chrome;
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(
    () => document.visibilityState === "visible",
  );

  useEffect(() => {
    const handleVisibilityChange = () =>
      setIsDocumentVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (!isChromium) return;

    const threshold = 160;
    const detectDevTools = () => {
      const widthDiff = Math.abs(window.outerWidth - window.innerWidth);
      const heightDiff = Math.abs(window.outerHeight - window.innerHeight);
      setIsDevToolsOpen(widthDiff > threshold || heightDiff > threshold);
    };

    window.addEventListener("resize", detectDevTools, { passive: true });
    detectDevTools();

    return () => window.removeEventListener("resize", detectDevTools);
  }, [isChromium]);

  useEffect(() => {
    if (
      isMobile ||
      prefersReducedMotion ||
      !isDocumentVisible ||
      (isChromium && isDevToolsOpen)
    )
      return;

    let lastX = 0;
    let lastY = 0;
    let ticking = false;
    let frameId: number;

    const update = () => {
      const writes: (() => void)[] = [];
      for (const handler of handlers.current) {
        const writeFn = handler(lastX, lastY);
        if (writeFn) writes.push(writeFn);
      }
      for (const write of writes) {
        write();
      }
      ticking = false;
    };

    const handleInteraction = (event: MouseEvent | Event) => {
      if (event instanceof MouseEvent) {
        lastX = event.clientX;
        lastY = event.clientY;
      }
      if (!ticking) {
        frameId = requestAnimationFrame(update);
        ticking = true;
      }
    };

    document.addEventListener("mousemove", handleInteraction, {
      passive: true,
    });

    return () => {
      document.removeEventListener("mousemove", handleInteraction);
      cancelAnimationFrame(frameId);
    };
  }, [
    isMobile,
    prefersReducedMotion,
    isDocumentVisible,
    isChromium,
    isDevToolsOpen,
  ]);

  const register = (handler: MouseHandler) => handlers.current.add(handler);
  const unregister = (handler: MouseHandler) =>
    handlers.current.delete(handler);

  const contextValue = useRef({ register, unregister }).current;

  return (
    <MouseGlareContext.Provider value={contextValue}>
      {children}
    </MouseGlareContext.Provider>
  );
}

export default function useMouseGlare<T extends HTMLElement>(
  ref: RefObject<T | null>,
) {
  const context = useContext(MouseGlareContext);

  useEffect(() => {
    if (!context) return;
    const { register, unregister } = context;

    let isVisible = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    const handleMove = (clientX: number, clientY: number) => {
      const element = ref.current;
      if (!element || !isVisible) return;

      const swiperSlide = element.closest(".swiper-slide");
      if (
        swiperSlide &&
        !swiperSlide.classList.contains("swiper-slide-active")
      ) {
        return () => element.style.setProperty("--mouse-opacity", "0");
      }

      // Swiper posiciona os slides com transform, que não dispara ResizeObserver.
      // Ler a posição no frame atual mantém o glare alinhado durante e após a troca.
      const rect = element.getBoundingClientRect();

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const margin = 300;
      const distX = Math.max(
        0,
        x < 0 ? -x : x > rect.width ? x - rect.width : 0,
      );
      const distY = Math.max(
        0,
        y < 0 ? -y : y > rect.height ? y - rect.height : 0,
      );
      const distance = Math.sqrt(distX * distX + distY * distY);
      const proximity = Math.max(0, 1 - distance / margin);

      if (proximity > 0) {
        return () => {
          element.style.setProperty("--mouse-x", `${x}px`);
          element.style.setProperty("--mouse-y", `${y}px`);
          element.style.setProperty("--mouse-opacity", proximity.toFixed(2));
        };
      }

      return () => {
        element.style.setProperty("--mouse-opacity", "0");
      };
    };

    register(handleMove);

    return () => {
      unregister(handleMove);
      observer.disconnect();
    };
  }, [context, ref]);
}

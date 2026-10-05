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
import { useTheme } from "../contexts/theme-context";
import {
  cancelVisualUpdate,
  scheduleVisualUpdate,
} from "../utils/visual-frame";

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
  const { isDark } = useTheme();
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
    if (isMobile || !isDark || prefersReducedMotion || !isDocumentVisible)
      return;

    let lastX = 0;
    let lastY = 0;

    const update = () => {
      const writes: (() => void)[] = [];
      for (const handler of handlers.current) {
        const writeFn = handler(lastX, lastY);
        if (writeFn) writes.push(writeFn);
      }
      return () => {
        for (const write of writes) write();
      };
    };

    const handleInteraction = (event: MouseEvent | Event) => {
      if (event instanceof MouseEvent) {
        lastX = event.clientX;
        lastY = event.clientY;
      }
      scheduleVisualUpdate(update);
    };

    document.addEventListener("mousemove", handleInteraction, {
      passive: true,
    });

    return () => {
      document.removeEventListener("mousemove", handleInteraction);
      cancelVisualUpdate(update);
    };
  }, [isMobile, isDark, prefersReducedMotion, isDocumentVisible]);

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
  effectRef: RefObject<HTMLElement | null>,
  radius = 180,
) {
  const context = useContext(MouseGlareContext);

  useEffect(() => {
    if (!context) return;
    const { register, unregister } = context;

    let isVisible = false;
    let lastTransform = "";
    let lastOpacity = "0";

    const hide = () => {
      if (lastOpacity === "0") return;
      if (effectRef.current) effectRef.current.style.opacity = "0";
      lastOpacity = "0";
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (!isVisible) hide();
      },
      { threshold: 0 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    const handleMove = (clientX: number, clientY: number) => {
      const element = ref.current;
      const effect = effectRef.current;
      if (!element || !effect || !isVisible || element.closest("[inert]"))
        return;

      const swiperSlide = element.closest(".swiper-slide");
      if (
        swiperSlide &&
        !swiperSlide.classList.contains("swiper-slide-active")
      ) {
        return lastOpacity === "0" ? undefined : hide;
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
        const nextTransform = `translate3d(${x - radius}px, ${y - radius}px, 0)`;
        const nextOpacity = proximity.toFixed(2);
        if (nextTransform === lastTransform && nextOpacity === lastOpacity)
          return;
        const spotlights = effect.querySelectorAll<HTMLElement>(
          "[data-glare-spotlight]",
        );
        return () => {
          // Move the pre-painted spotlights; their gradient and border mask stay fixed.
          if (nextTransform !== lastTransform) {
            for (const spotlight of spotlights)
              spotlight.style.transform = nextTransform;
          }
          if (nextOpacity !== lastOpacity) effect.style.opacity = nextOpacity;
          lastTransform = nextTransform;
          lastOpacity = nextOpacity;
        };
      }

      return lastOpacity === "0" ? undefined : hide;
    };

    register(handleMove);

    return () => {
      unregister(handleMove);
      observer.disconnect();
    };
  }, [context, ref, effectRef, radius]);
}

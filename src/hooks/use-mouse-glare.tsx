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

type MouseHandler = (x: number, y: number) => void | (() => void);

interface MouseGlareContextType {
  register: (handler: MouseHandler) => void;
  unregister: (handler: MouseHandler) => void;
}

const MouseGlareContext = createContext<MouseGlareContextType | null>(null);

export function MouseGlareProvider({ children }: { children: ReactNode }) {
  const handlers = useRef<Set<MouseHandler>>(new Set());
  const isMobile = useMediaQuery("(hover: none) and (pointer: coarse)");
  const isChromium = !!(window as unknown as { chrome: unknown }).chrome;
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

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
    if (isMobile || (isChromium && isDevToolsOpen)) return;

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
  }, [isMobile, isChromium, isDevToolsOpen]);

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

    if (ref.current) observer.observe(ref.current);

    const handleMove = (clientX: number, clientY: number) => {
      const element = ref.current;
      if (!element || !isVisible) return;

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
      } else {
        return () => {
          element.style.setProperty("--mouse-opacity", "0");
        };
      }
    };

    register(handleMove);

    return () => {
      unregister(handleMove);
      observer.disconnect();
    };
  }, [context, ref]);
}

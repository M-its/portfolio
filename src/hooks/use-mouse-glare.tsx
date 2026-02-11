import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type RefObject,
  type ReactNode,
} from "react";

type MouseHandler = (x: number, y: number) => void;

interface MouseGlareContextType {
  register: (handler: MouseHandler) => void;
  unregister: (handler: MouseHandler) => void;
}

const MouseGlareContext = createContext<MouseGlareContextType | null>(null);

export function MouseGlareProvider({ children }: { children: ReactNode }) {
  const handlers = useRef<Set<MouseHandler>>(new Set());

  useEffect(() => {
    let frameId: number | undefined;
    let lastX = 0;
    let lastY = 0;
    let ticking = false;

    const update = () => {
      for (const handler of handlers.current) {
        handler(lastX, lastY);
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
    window.addEventListener("scroll", handleInteraction, {
      passive: true,
      capture: true,
    });

    return () => {
      document.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
      if (frameId !== undefined) cancelAnimationFrame(frameId);
    };
  }, []);

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

    const handleMove = (clientX: number, clientY: number) => {
      const element = ref.current;
      if (!element) return;

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
        element.style.setProperty("--mouse-x", `${x}px`);
        element.style.setProperty("--mouse-y", `${y}px`);
        element.style.setProperty("--mouse-opacity", proximity.toFixed(2));
      } else {
        element.style.setProperty("--mouse-opacity", "0");
      }
    };

    register(handleMove);
    return () => unregister(handleMove);
  }, [context, ref]);
}

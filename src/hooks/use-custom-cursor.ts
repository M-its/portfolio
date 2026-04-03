import { useEffect, useState } from "react";

function detectUnsupported(threshold: number): boolean {
  if (typeof window === "undefined") return true;

  // Se a tela for pequena (mobile/tablet/RDM), desativa o cursor por padrão
  if (window.innerWidth <= 768) return true;

  const widthDiff = Math.abs(window.outerWidth - window.innerWidth);
  const heightDiff = Math.abs(window.outerHeight - window.innerHeight);
  const isDevToolsOpen = widthDiff > threshold || heightDiff > threshold;

  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isMobileUserAgent = /Mobi|Android|iPhone/i.test(navigator.userAgent);
  const isPointerCoarse = window.matchMedia("(pointer: coarse)").matches;

  // Em modo de design responsivo o cursor customizado deve ser desativado.
  return isDevToolsOpen || hasTouch || isMobileUserAgent || isPointerCoarse;
}

export default function useCustomCursor(threshold = 160) {
  const [isUnsupported, setIsUnsupported] = useState(() =>
    detectUnsupported(threshold),
  );

  useEffect(() => {
    const handleCheck = () => {
      setIsUnsupported(detectUnsupported(threshold));
    };

    // Atualiza o estado inicial
    handleCheck();

    // Evento de resize na janela (ajuda com docked devtools)
    window.addEventListener("resize", handleCheck);

    // ResizeObserver (crucial para o Modo de Design Responsivo no Firefox)
    const observer = new ResizeObserver(() => {
      handleCheck();
    });
    observer.observe(document.documentElement);

    return () => {
      window.removeEventListener("resize", handleCheck);
      observer.disconnect();
    };
  }, [threshold]);

  return { isUnsupported };
}

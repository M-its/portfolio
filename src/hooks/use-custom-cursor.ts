import { useEffect, useState } from "react";

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

function detectUnsupported(): boolean {
  if (typeof window === "undefined") return true;

  const isMobileUserAgent = /Mobi|Android|iPhone/i.test(navigator.userAgent);
  const hasFinePointer = window.matchMedia(FINE_POINTER_QUERY).matches;

  return window.innerWidth <= 768 || isMobileUserAgent || !hasFinePointer;
}

export default function useCustomCursor() {
  const [isUnsupported, setIsUnsupported] = useState(detectUnsupported);

  useEffect(() => {
    const pointerQuery = window.matchMedia(FINE_POINTER_QUERY);
    const handleCheck = () => setIsUnsupported(detectUnsupported());

    window.addEventListener("resize", handleCheck);
    pointerQuery.addEventListener("change", handleCheck);

    return () => {
      window.removeEventListener("resize", handleCheck);
      pointerQuery.removeEventListener("change", handleCheck);
    };
  }, []);

  return { isUnsupported };
}

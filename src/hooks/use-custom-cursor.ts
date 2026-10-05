import { useEffect, useState } from "react";

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
const FORCED_COLORS_QUERY = "(forced-colors: active)";

function detectUnsupported(): boolean {
  if (typeof window === "undefined") return true;

  const hasFinePointer = window.matchMedia(FINE_POINTER_QUERY).matches;

  return !hasFinePointer || window.matchMedia(FORCED_COLORS_QUERY).matches;
}

export default function useCustomCursor() {
  const [isUnsupported, setIsUnsupported] = useState(detectUnsupported);

  useEffect(() => {
    const pointerQuery = window.matchMedia(FINE_POINTER_QUERY);
    const colorQuery = window.matchMedia(FORCED_COLORS_QUERY);
    const handleCheck = () => setIsUnsupported(detectUnsupported());

    window.addEventListener("resize", handleCheck);
    pointerQuery.addEventListener("change", handleCheck);
    colorQuery.addEventListener("change", handleCheck);

    return () => {
      window.removeEventListener("resize", handleCheck);
      pointerQuery.removeEventListener("change", handleCheck);
      colorQuery.removeEventListener("change", handleCheck);
    };
  }, []);

  return { isUnsupported };
}

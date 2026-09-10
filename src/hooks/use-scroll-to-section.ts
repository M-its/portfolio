import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function useScrollToSection(offset = -120) {
  const navigate = useNavigate();

  const scrollToSection = useCallback(
    (sectionId: string) => {
      const element = document.getElementById(sectionId);
      if (element) {
        const elementPosition =
          element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition + offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      } else {
        navigate(`/#${sectionId}`);
      }
    },
    [navigate, offset],
  );

  return scrollToSection;
}

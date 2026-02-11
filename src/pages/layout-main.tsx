import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import Header from "../core-components/header";
import Footer from "../core-components/footer";
import CustomCursor from "../components/custom-cursor";
import AnimatedSection, {
  animationVariants,
} from "../components/animated-section.tsx";

import useBrowserFeatures from "../hooks/use-browser-features";

import { warnDevtoolsDisabled } from "../utils/warn-once";
import { MouseGlareProvider } from "../hooks/use-mouse-glare.tsx";

export default function LayoutMain() {
  const { isUnsupported } = useBrowserFeatures();

  useEffect(() => {
    document.documentElement.style.cursor = isUnsupported ? "auto" : "none";
    warnDevtoolsDisabled();
  }, [isUnsupported]);

  return (
    <div>
      <MouseGlareProvider>
        <CustomCursor />
        <Header />
        <Outlet />
        <AnimatedSection
          variants={animationVariants.blur}
          delay={0.2}
          as="footer"
          repeatOnView
        >
          <Footer />
        </AnimatedSection>
      </MouseGlareProvider>
    </div>
  );
}

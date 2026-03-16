import { Outlet } from "react-router-dom";
import Header from "../core-components/header";
import Footer from "../core-components/footer";
import CustomCursor from "../components/custom-cursor";
import AnimatedSection from "../components/animated-section.tsx";
import { warnDevtoolsDisabled } from "../utils/warn-once";
import { initConsoleEasterEgg } from "../utils/console-easter-egg";
import { MouseGlareProvider } from "../hooks/use-mouse-glare.tsx";

warnDevtoolsDisabled();
initConsoleEasterEgg();

export default function LayoutMain() {
  return (
    <div>
      <MouseGlareProvider>
        <CustomCursor />
        <Header />
        <Outlet />
        <AnimatedSection delay={0.2} as="footer">
          <Footer />
        </AnimatedSection>
      </MouseGlareProvider>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import IntroSplash from "./core-components/intro-splash";
import PageComponents from "./pages/page-components";
import LayoutMain from "./pages/layout-main";
import PageHome from "./pages/page-home";

export default function App() {
  const [showIntro, setShowIntro] = useState(() => {
    return !localStorage.getItem("visited");
  });

  useEffect(() => {
    // Remove splash
    const root = document.getElementById("root");
    if (root) {
      root.classList.add("loaded");
      setTimeout(() => {
        root.classList.add("loaded-complete");
      }, 500);
    }

    if (showIntro) {
      localStorage.setItem("visited", "true");
    }
  }, [showIntro]);

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <IntroSplash
            key="intro"
            onFinish={() => {
              setTimeout(() => {
                setShowIntro(false);
              }, 800);
            }}
          />
        )}
      </AnimatePresence>

      <div className="h-full w-full">
        <Routes>
          <Route element={<LayoutMain />}>
            <Route index element={<PageHome />} />
            <Route path="/components" element={<PageComponents />} />
          </Route>
        </Routes>
      </div>
    </>
  );
}

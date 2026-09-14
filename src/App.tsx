import { AnimatePresence } from "framer-motion";
import { Suspense, lazy, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import IntroSplash from "./core-components/intro-splash";
import LayoutMain from "./pages/layout-main";
import PageHome from "./pages/page-home";
import { loadProjectDetailsPage } from "./utils/project-details-loader";

const PageComponents = lazy(() => import("./pages/page-components"));
const PageProjectDetails = lazy(loadProjectDetailsPage);
const PageProjectNotFound = lazy(
  () => import("./pages/page-project-not-found"),
);
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
          <IntroSplash key="intro" onFinish={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      <div className="h-full w-full">
        <Suspense fallback={<div />}>
          <Routes>
            <Route element={<LayoutMain />}>
              <Route index element={<PageHome />} />
              <Route
                path="projects/:slug"
                element={<PageProjectDetails />}
              />
              <Route path="/components" element={<PageComponents />} />
              <Route path="*" element={<PageProjectNotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </div>
    </>
  );
}

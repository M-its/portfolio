import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

import ListIcon from "../assets/icons/list.svg?react";
import XIcon from "../assets/icons/x.svg?react";
import LogoIcon from "../assets/images/logo-plain.svg?react";

import cx from "classnames";
import { motion, AnimatePresence } from "framer-motion";

import useScrolled from "../hooks/use-scrolled.ts";

import Container from "../components/container.tsx";
import Button from "../components/button.tsx";
import Icon from "../components/icon.tsx";
import DesktopNav from "./header-desktop-nav.tsx";
import MobileMenu from "./header-mobile-menu.tsx";

type HeaderProps = React.ComponentProps<typeof Container>;

export default function Header({ className, ...props }: HeaderProps) {
  const location = useLocation();
  const previousPathRef = useRef(location.pathname);
  const isReturningHome =
    location.pathname === "/" &&
    previousPathRef.current.startsWith("/projects/");
  const [suppressRouteMotion, setSuppressRouteMotion] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrolled(72, 24);
  const menuRef = useRef<HTMLDivElement>(null);
  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  useLayoutEffect(() => {
    const shouldSuppress =
      location.pathname === "/" &&
      previousPathRef.current.startsWith("/projects/");
    previousPathRef.current = location.pathname;
    if (!shouldSuppress) return;

    setSuppressRouteMotion(true);
    const firstFrame = window.requestAnimationFrame(() => {
      const secondFrame = window.requestAnimationFrame(() => {
        setSuppressRouteMotion(false);
      });
      firstFrameRef.current = secondFrame;
    });
    const firstFrameRef = { current: firstFrame };

    return () => window.cancelAnimationFrame(firstFrameRef.current);
  }, [location.pathname]);

  const disableRouteMotion = isReturningHome || suppressRouteMotion;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    if (menuOpen) {
      const width = window.innerWidth - document.documentElement.clientWidth;
      setScrollbarWidth(width);

      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${width}px`;

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    } else {
      setScrollbarWidth(0);
      document.body.style.overflow = "";
      document.body.style.paddingRight = "0px";

      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "0px";
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [menuOpen]);

  return (
    <>
      <div
        style={{
          paddingRight: scrollbarWidth,
        }}
        className="pointer-events-none fixed inset-x-0 top-0 z-50"
      >
        <div
          aria-hidden="true"
          className={cx(
            "absolute inset-x-0 mx-auto border-icon-primary/20",
            disableRouteMotion
              ? "transition-none"
              : "transition-[top,width,max-width,height,border-radius,background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-out motion-reduce:transition-none",
            scrolled
              ? "top-4 h-[58px] w-[90%] max-w-[1200px] rounded-2xl border bg-header-surface backdrop-blur-[8px] shadow-header-scrolled"
              : "top-0 h-[89px] w-full max-w-[1400px] border-b bg-transparent sm:h-[105px] md:h-[121px]",
            menuOpen && "border-transparent",
          )}
        />

        <Container
          as="header"
          className={cx(
            "pointer-events-auto absolute inset-x-0 mx-auto flex w-[90%] max-w-[1200px] items-center justify-between",
            disableRouteMotion
              ? "transition-none"
              : "transition-[top] duration-300 ease-out motion-reduce:transition-none",
            scrolled ? "top-6" : "top-6 sm:top-8 md:top-10",
            className,
          )}
          {...props}
        >
          <Link to="/" className="flex justify-center items-center gap-3 z-50">
            <Icon svg={LogoIcon} size="xl" />
            <Button
              mode="text"
              size="xl"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setMenuOpen(false);
              }}
            >
              M-its
            </Button>
          </Link>

          {/* NAV DESKTOP */}
          <DesktopNav />

          {/* BOTÃO HAMBURGUER */}
          <motion.button
            className="lg:hidden p-2 fill-current z-50 relative cursor-pointer"
            onClick={() => setMenuOpen((p) => !p)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            animate={{ rotate: menuOpen ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {menuOpen ? (
              <Icon svg={XIcon} size="lg" className="text-current" />
            ) : (
              <Icon svg={ListIcon} size="lg" />
            )}
          </motion.button>
        </Container>
      </div>

      {/* MENU MOBILE */}
      <AnimatePresence>
        {menuOpen && (
          <MobileMenu ref={menuRef} onLinkClick={() => setMenuOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

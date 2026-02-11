import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import ListIcon from "../assets/icons/list.svg?react";
import XIcon from "../assets/icons/x.svg?react";
import LogoIcon from "../assets/images/logo-plain.svg?react";

import cx from "classnames";
import { motion, AnimatePresence } from "framer-motion";

import useBrowserFeatures from "../hooks/use-browser-features.ts";
import useScrolled from "../hooks/use-scrolled.ts";
import { useTheme } from "../contexts/theme-context.tsx";

import Container from "../components/container.tsx";
import Button from "../components/button.tsx";
import Icon from "../components/icon.tsx";
import DesktopNav from "./header-desktop-nav.tsx";
import MobileMenu from "./header-mobile-menu.tsx";

interface HeaderProps extends React.ComponentProps<typeof Container> {}

export default function Header({ className, ...props }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrolled(50);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  const { isUnsupported } = useBrowserFeatures();

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
      <motion.div
        layout
        initial={false}
        animate={scrolled ? "floating" : "default"}
        style={{
          paddingRight: scrollbarWidth,
        }}
        variants={{
          default: { top: 0, width: "100%", maxWidth: "1400px" },
          floating: {
            top: 16,
            width: "90%",
            maxWidth: "1400px",
            borderRadius: "16px",
            backgroundColor: isDark
              ? "rgba(255,255,255,0.05)"
              : "rgba(255,255,255,0.35)",
            backdropFilter: isUnsupported ? "none" : "blur(15px)",
            boxShadow: "0px 4px 30px rgba(0,0,0,0.1)",
          },
        }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className={cx(
          "fixed left-1/2 -translate-x-1/2 z-50 transition-colors duration-300",
          scrolled ? "py-2 border" : "py-6 sm:py-8 md:py-10 border-b",
          menuOpen ? "border-transparent" : "border-icon-primary/20",
        )}
      >
        <Container
          as="header"
          className={cx(
            "flex justify-between items-center relative",
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
      </motion.div>

      {/* MENU MOBILE */}
      <AnimatePresence>
        {menuOpen && (
          <MobileMenu ref={menuRef} onLinkClick={() => setMenuOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

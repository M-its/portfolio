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
import { isolateModalBackground } from "../utils/modal-background";
import {
  MOBILE_MENU_STATE_EVENT,
  type MobileMenuStateDetail,
} from "../utils/ui-events.ts";

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  useLayoutEffect(() => {
    const shouldSuppress =
      location.pathname === "/" &&
      previousPathRef.current.startsWith("/projects/");
    previousPathRef.current = location.pathname;
    setMenuOpen(false);
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
    if (!menuOpen) {
      setScrollbarWidth(0);
      return;
    }
    const dialog = dialogRef.current;
    if (!dialog) return;
    const toggle = menuToggleRef.current;
    const restoreBackground = isolateModalBackground(dialog);
    const bodyOverflow = document.body.style.overflow;
    const bodyPadding = document.body.style.paddingRight;
    const rootOverflow = document.documentElement.style.overflow;
    const width = window.innerWidth - document.documentElement.clientWidth;
    setScrollbarWidth(width);
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${width}px`;
    document.documentElement.style.overflow = "hidden";

    const focusMenu = () => {
      menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus({
        preventScroll: true,
      });
    };
    const focusableControls = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), [tabindex="0"]',
        ),
      ).filter((control) => {
        if (control.tabIndex < 0) return false;
        let element: HTMLElement | null = control;
        while (element && element !== dialog) {
          const style = getComputedStyle(element);
          if (
            element.hidden ||
            element.inert ||
            style.display === "none" ||
            style.visibility === "hidden"
          )
            return false;
          element = element.parentElement;
        }
        return true;
      });

    function handleClickOutside(event: MouseEvent) {
      if (!dialog?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const controls = focusableControls();
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) return;
      if (
        !dialog?.contains(document.activeElement) ||
        (event.shiftKey
          ? document.activeElement === first
          : document.activeElement === last)
      ) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus({ preventScroll: true });
      }
    }
    function containFocus(event: FocusEvent) {
      if (!dialog?.contains(event.target as Node)) focusMenu();
    }
    focusMenu();
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    document.addEventListener("focusin", containFocus);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
      document.removeEventListener("focusin", containFocus);
      restoreBackground();
      document.body.style.overflow = bodyOverflow;
      document.body.style.paddingRight = bodyPadding;
      document.documentElement.style.overflow = rootOverflow;
      const focusTarget =
        toggle?.isConnected && getComputedStyle(toggle).display !== "none"
          ? toggle
          : dialog.querySelector<HTMLAnchorElement>("a[href]");
      if (focusTarget?.isConnected) focusTarget.focus({ preventScroll: true });
    };
  }, [menuOpen]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const closeMenuOnDesktop = () => {
      if (desktopQuery.matches) setMenuOpen(false);
    };

    closeMenuOnDesktop();
    desktopQuery.addEventListener("change", closeMenuOnDesktop);
    return () => desktopQuery.removeEventListener("change", closeMenuOnDesktop);
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent<MobileMenuStateDetail>(MOBILE_MENU_STATE_EVENT, {
        detail: { open: menuOpen },
      }),
    );
  }, [menuOpen]);

  return (
    <div
      ref={dialogRef}
      role={menuOpen ? "dialog" : undefined}
      {...(menuOpen
        ? { "aria-modal": true, "aria-label": "Menu de navegação" }
        : {})}
    >
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
          <Link
            to="/"
            className="flex justify-center items-center gap-3 z-50 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-text-primary"
            aria-label="M-its — voltar ao início"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setMenuOpen(false);
            }}
          >
            <Icon svg={LogoIcon} size="xl" />
            <Button as="span" mode="text" size="xl">
              M-its
            </Button>
          </Link>

          {/* NAV DESKTOP */}
          <DesktopNav />

          {/* BOTÃO HAMBURGUER */}
          <motion.button
            ref={menuToggleRef}
            type="button"
            className="lg:hidden p-2 fill-current z-50 relative cursor-pointer"
            onClick={() => setMenuOpen((p) => !p)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
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
      <div
        id="mobile-navigation"
        inert={!menuOpen}
        aria-hidden={!menuOpen || undefined}
      >
        <AnimatePresence>
          {menuOpen && (
            <MobileMenu ref={menuRef} onLinkClick={() => setMenuOpen(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

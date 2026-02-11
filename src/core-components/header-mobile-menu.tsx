import { forwardRef } from "react";
import { motion, type Variants } from "framer-motion";
import useScrollToSection from "../hooks/use-scroll-to-section.ts";
import Button from "../components/button.tsx";
import ThemeSwitcher from "../components/theme-switcher.tsx";

// Variantes de animação para o menu
const menuVariants: Variants = {
  hidden: {
    opacity: 0,
    y: "-100%",
    transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] as const },
  },
  visible: {
    opacity: 1,
    y: "0%",
    transition: {
      duration: 0.6,
      ease: [0.76, 0, 0.24, 1] as const,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    y: "-100%",
    transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] as const },
  },
};

// Variantes para os Links
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const links = [
  { label: "About", section: "about", number: "01" },
  { label: "Tech", section: "techs", number: "02" },
  { label: "Projects", section: "projects", number: "03" },
];

interface MobileMenuProps {
  onLinkClick: () => void;
}

const MobileMenu = forwardRef<HTMLDivElement, MobileMenuProps>(
  ({ onLinkClick }, ref) => {
    const scrollToSection = useScrollToSection();

    return (
      <motion.div
        ref={ref}
        key="mobile-menu"
        variants={menuVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-40 bg-background/95 backdrop-blur-2xl flex flex-col justify-between"
      >
        <div className="h-24 md:h-32" />

        {/* LINKS */}
        <div className="flex flex-col px-6 md:px-12 w-full max-w-2xl mx-auto">
          {links.map((link) => (
            <motion.div
              key={`mobile-${link.section}`}
              variants={itemVariants}
              className="group border-b border-icon-primary/15 last:border-none"
            >
              <Button
                mode="text"
                align="left"
                onClick={() => {
                  scrollToSection(link.section);
                  onLinkClick();
                }}
                className="w-full py-6 group-hover:pl-4 transition-all duration-300"
              >
                <span className="flex items-baseline gap-4 w-full">
                  <span className="text-sm font-mono opacity-50 text-primary">
                    {link.number} .
                  </span>
                  <span className="text-5xl md:text-7xl font-light tracking-tight group-hover:text-primary transition-colors">
                    {link.label}
                  </span>
                </span>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* RODAPÉ DO MENU */}
        <motion.div
          variants={itemVariants}
          className="p-8 md:p-12 flex justify-between items-end border-t border-card-border/50 bg-linear-to-t from-black/5 to-transparent"
        >
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest opacity-40">
              Preferências
            </span>
            <ThemeSwitcher />
          </div>

          <div className="text-right opacity-30 text-xs md:text-sm">
            <p>&copy; 2024 M-its Portfolio</p>
            <p>Designed with passion.</p>
          </div>
        </motion.div>
      </motion.div>
    );
  },
);

MobileMenu.displayName = "MobileMenu";

export default MobileMenu;

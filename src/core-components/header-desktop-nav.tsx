import useScrollToSection from "../hooks/use-scroll-to-section.ts";
import Button from "../components/button.tsx";
import Divider from "../components/divider.tsx";
import ThemeSwitcher from "../components/theme-switcher.tsx";

const links = [
  { label: "About", section: "about" },
  { label: "Tech", section: "techs" },
  { label: "Projects", section: "projects" },
];

export default function DesktopNav() {
  const scrollToSection = useScrollToSection();

  return (
    <nav className="hidden lg:flex items-center gap-10">
      {links.map((link) => (
        <Button
          mode="text"
          key={`header-${link.section}`}
          onClick={() => scrollToSection(link.section)}
          className="cursor-pointer opacity-70 hover:opacity-100 transition-all font-medium tracking-wide"
        >
          {link.label}
        </Button>
      ))}
      <Divider orientation="vertical" className="h-4" />
      <ThemeSwitcher />
    </nav>
  );
}

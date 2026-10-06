import { useTheme } from "../contexts/theme-context";

const containerClass = `
  flex h-6 w-14 cursor-pointer rounded-full
  shadow-theme-switcher-container transition-colors duration-300
`;

const trackClass = `
  flex h-6 w-14 items-center rounded-full bg-theme-switcher-track p-1
  transition-colors duration-300
`;

const toggleClass = `
  theme-switcher-toggle h-5 w-5 rounded-full border
  border-theme-switcher-toggle-border bg-theme-switcher-toggle
  shadow-theme-switcher-toggle transition-all duration-500
`;

export default function ThemeSwitcher() {
  const { isDark, setTheme } = useTheme();

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="relative flex items-center justify-center bg-transparent">
      <button
        className={containerClass}
        type="button"
        aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
        aria-pressed={isDark}
        onClick={handleToggle}
      >
        <div className={trackClass}>
          <div className={toggleClass} />
        </div>
      </button>
    </div>
  );
}

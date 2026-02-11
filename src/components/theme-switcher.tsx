import { tv } from "tailwind-variants";
import { useTheme } from "../contexts/theme-context";

const container = tv({
  base: `
    w-14 h-6 rounded-full flex cursor-pointer
    transition-colors duration-300
  `,
  variants: {
    theme: {
      dark: "shadow-switcher-container-dark",
      light: "shadow-switcher-container-light",
    },
  },
  defaultVariants: { theme: "dark" },
});

const border = tv({
  base: `
    w-14 h-6 rounded-full flex items-center p-1
    transition-colors duration-300
  `,
  variants: {
    theme: {
      dark: "bg-gray-800",
      light: "bg-sepia",
    },
  },
  defaultVariants: { theme: "dark" },
});

const toggle = tv({
  base: `
    w-5 h-5 rounded-full transition-all duration-500 
    border
  `,
  variants: {
    theme: {
      dark: "bg-gray-800 border-transparent shadow-switcher-toggle-dark",
      light:
        "bg-yellow-200 border border-yellow-200 shadow-switcher-toggle-light",
    },
  },
  defaultVariants: { theme: "dark" },
});

export default function ThemeSwitcher() {
  const { isDark, setTheme } = useTheme();

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="relative flex items-center justify-center bg-transparent">
      <button
        className={container({ theme: isDark ? "dark" : "light" })}
        type="button"
        aria-label="theme-switcher"
        aria-pressed={isDark}
        onClick={handleToggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") handleToggle();
        }}
      >
        <div className={border({ theme: isDark ? "dark" : "light" })}>
          <div
            className={`${toggle({ theme: isDark ? "dark" : "light" })} ${
              isDark ? "translate-x-0" : "translate-x-[30px] rotate-360"
            }`}
          />
        </div>
      </button>
    </div>
  );
}

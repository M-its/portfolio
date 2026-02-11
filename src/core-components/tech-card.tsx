import { useRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import Card from "../components/card";
import Text from "../components/text";
import Icon from "../components/icon";
import useMouseGlare from "../hooks/use-mouse-glare";
import type { techs } from "../data/techs";
import { useTheme } from "../contexts/theme-context";

const techCardVariants = tv({
  slots: {
    card: `
      relative group h-full w-full rounded-xl flex flex-col items-center justify-center p-2
      transition-all duration-300 ease-in-out border-0
    `,
    icon: "fill-btn-primary-text transition-transform duration-300 group-hover:scale-110",
    text: "text-btn-primary-text opacity-70 group-hover:opacity-100 transition-all uppercase tracking-wider text-center",
    baseBorder: "absolute inset-0 rounded-2xl pointer-events-none z-1 border",
    revealWrapper:
      "absolute inset-0 rounded-xl pointer-events-none z-10 transition-opacity duration-300 overflow-hidden",
    revealBorder: "absolute inset-0 rounded-2xl border-[1.5px] border-white/40",
    revealBg: "absolute inset-0 bg-white/5",
  },
  variants: {
    size: {
      sm: {
        icon: "w-5 h-5",
        text: "text-[10px]",
      },
      md: {
        icon: "w-7 h-7",
        text: "text-[11px]",
      },
      lg: {
        icon: "w-10 h-10",
        text: "text-sm",
      },
    },
    isDark: {
      true: {
        baseBorder: "border-white/5",
      },
      false: {
        card: "hover:bg-btn-primary-bg-hover hover:border-icon-primary/20",
        baseBorder: "border-icon-primary/10",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

interface TechCardProps extends Omit<React.ComponentProps<"div">, "size"> {
  tech: (typeof techs)[0];
  size?: VariantProps<typeof techCardVariants>["size"];
}

export default function TechCard({ tech, size, className }: TechCardProps) {
  const { isDark } = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  useMouseGlare(cardRef);

  const {
    card,
    icon,
    text,
    baseBorder,
    revealWrapper,
    revealBorder,
    revealBg,
  } = techCardVariants({ size, isDark });

  return (
    <Card
      ref={cardRef}
      className={card({ className })}
      style={
        {
          "--mouse-x": "-9999px",
          "--mouse-y": "-9999px",
          "--mouse-opacity": "0",
        } as React.CSSProperties
      }
    >
      {/* BORDA BASE */}
      <div className={baseBorder()} />

      {/* REVEAL (Dark Mode) */}
      {isDark && (
        <div
          className={revealWrapper()}
          style={{
            opacity: "var(--mouse-opacity)",
            maskImage:
              "radial-gradient(100px circle at var(--mouse-x) var(--mouse-y), black, transparent)",
            WebkitMaskImage:
              "radial-gradient(100px circle at var(--mouse-x) var(--mouse-y), black, transparent)",
          }}
        >
          <div className={revealBorder()} />
          <div className={revealBg()} />
        </div>
      )}

      {/* CONTEÚDO */}
      <div className="relative z-20 flex flex-col items-center gap-2">
        <Icon svg={tech.icon} className={icon()} />
        <Text variant="tech-label" className={text()}>
          {tech.name}
        </Text>
      </div>
    </Card>
  );
}

import { useRef, useState } from "react";
import { Suspense } from "react";

import { tv, type VariantProps } from "tailwind-variants";
import Card from "../components/card";
import Text from "../components/text";
import Icon from "../components/icon";
import useMouseGlare from "../hooks/use-mouse-glare";
import { type techs, SpinnerIcon } from "../data/techs";
import { useTheme } from "../contexts/theme-context";

const techCardVariants = tv({
  slots: {
    card: `
      relative group h-full w-full rounded-xl flex flex-col items-center justify-center p-2
      border-0
    `,
    icon: `
      text-btn-primary-text
      [.group:not(:hover)_&_path]:fill-current 
      [.group:not(:hover)_&_circle]:fill-current
      [.group:not(:hover)_&_rect]:fill-current 
    `,
    text: "text-btn-primary-text opacity-70 uppercase tracking-wider text-center",
    baseBorder: "absolute inset-0 rounded-2xl pointer-events-none z-1 border",
    revealWrapper:
      "absolute inset-0 rounded-xl pointer-events-none z-10 overflow-hidden",
    revealBorder: "absolute inset-0 rounded-2xl border-[1.5px] border-white/40",
    revealBg: "absolute inset-0 bg-white/5",
  },
  variants: {
    size: {
      sm: { icon: "w-5 h-5", text: "text-[10px]" },
      md: { icon: "w-7 h-7", text: "text-[11px]" },
      lg: { icon: "w-11 h-11", text: "text-sm" },
    },
    isDark: {
      true: { baseBorder: "border-white/5" },
      false: {
        card: "hover:bg-btn-primary-bg-hover hover:border-icon-primary/20",
        baseBorder: "border-icon-primary/10",
      },
    },
  },
  defaultVariants: { size: "lg" },
});

interface TechCardProps extends Omit<React.ComponentProps<"div">, "size"> {
  tech: (typeof techs)[0];
  size?: VariantProps<typeof techCardVariants>["size"];
}

export default function TechCard({ tech, size, className }: TechCardProps) {
  const { isDark } = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={
        {
          "--mouse-x": "-9999px",
          "--mouse-y": "-9999px",
          "--mouse-opacity": "0",
          transition: "background-color 0.3s ease-in-out",
        } as React.CSSProperties
      }
    >
      <div
        className={baseBorder()}
        style={{ transition: "border-color 0.3s" }}
      />

      {isDark && (
        <div
          className={revealWrapper()}
          style={{
            opacity: "var(--mouse-opacity)",
            transition: "opacity 0.3s",
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

      <div
        className="relative z-20 flex flex-col items-center gap-5"
        style={{
          transform: isHovered ? "scale(1.1)" : "scale(1)",
          transition: "transform 0.3s ease-out",
        }}
      >
        <Suspense fallback={<Icon svg={SpinnerIcon} className={icon()} />}>
          <Icon
            svg={tech.icon}
            className={icon()}
            style={{
              filter: isHovered
                ? "drop-shadow(0 0 8px rgba(255,255,255,0.5))"
                : "none",
              transition: "filter 0.3s",
            }}
          />
        </Suspense>
        <Text
          variant="tech-label"
          className={text()}
          style={{
            opacity: isHovered ? 1 : 0.7,
            transition: "opacity 0.3s",
          }}
        >
          {tech.name}
        </Text>
      </div>
    </Card>
  );
}

import { useRef, useState } from "react";
import { Suspense } from "react";

import { tv, type VariantProps } from "tailwind-variants";
import Card from "../components/card";
import Text from "../components/text";
import Icon from "../components/icon";
import MouseGlare from "../components/mouse-glare";
import useMouseGlare from "../hooks/use-mouse-glare";
import { type techs, SpinnerIcon } from "../data/techs";

const techCardVariants = tv({
  slots: {
    card: `
      relative group h-full w-full rounded-xl flex flex-col items-center justify-center p-2
      border-0 hover:bg-tech-card-surface-hover hover:border-tech-card-border-hover
    `,
    icon: `
      text-button-primary-content
      [.group:not(:hover)_&_path]:fill-current 
      [.group:not(:hover)_&_circle]:fill-current
      [.group:not(:hover)_&_rect]:fill-current 
    `,
    text: "text-button-primary-content opacity-70 uppercase tracking-wider text-center",
    baseBorder:
      "absolute inset-0 rounded-2xl pointer-events-none z-1 border border-tech-card-border",
    revealWrapper:
      "absolute inset-0 rounded-xl pointer-events-none z-10 overflow-hidden",
  },
  variants: {
    size: {
      sm: { icon: "w-5 h-5", text: "text-[10px]" },
      md: { icon: "w-7 h-7", text: "text-[11px]" },
      lg: { icon: "w-11 h-11", text: "text-sm" },
    },
  },
  defaultVariants: { size: "lg" },
});

interface TechCardProps extends Omit<React.ComponentProps<"div">, "size"> {
  tech: (typeof techs)[0];
  size?: VariantProps<typeof techCardVariants>["size"];
}

export default function TechCard({ tech, size, className }: TechCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  useMouseGlare(cardRef, revealRef, 100);

  const { card, icon, text, baseBorder, revealWrapper } = techCardVariants({
    size,
  });

  return (
    <Card
      ref={cardRef}
      className={card({ className })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={
        {
          transition: "background-color 0.3s ease-in-out",
          willChange: "transform, background-color, border-color",
          contain: "layout style paint",
        } as React.CSSProperties
      }
    >
      <div
        className={baseBorder()}
        style={{ transition: "border-color 0.3s" }}
      />

      <MouseGlare
        ref={revealRef}
        className={`tech-card-theme-reveal ${revealWrapper()}`}
        radius={100}
        borderClassName="rounded-2xl"
        borderColor="var(--color-tech-card-reveal-border)"
        surfaceColor="var(--color-tech-card-reveal-surface)"
        style={{ transition: "opacity 0.3s" }}
      />

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
              filter: isHovered ? "var(--filter-tech-icon-hover)" : "none",
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

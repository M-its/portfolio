import type { ComponentProps } from "react";

type MouseGlareProps = ComponentProps<"div"> & {
  radius: number;
  borderColor: string;
  surfaceColor: string;
  borderClassName: string;
};

export default function MouseGlare({
  radius,
  borderColor,
  surfaceColor,
  borderClassName,
  className,
  style,
  ...props
}: MouseGlareProps) {
  const spotlightStyle = {
    width: radius * 2,
    height: radius * 2,
    transform: "translate3d(-9999px, -9999px, 0)",
  };
  const gradient = (color: string) =>
    `radial-gradient(${radius}px circle at center, ${color}, transparent)`;

  return (
    <div
      {...props}
      className={`${className ?? ""} overflow-hidden`}
      style={{ opacity: 0, ...style }}
    >
      <div
        className={`${borderClassName} pointer-events-none absolute inset-0`}
        style={{
          padding: "1.5px",
          maskImage: "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
          maskClip: "content-box, border-box",
          maskComposite: "exclude",
        }}
      >
        <div
          data-glare-spotlight
          className="pointer-events-none absolute left-0 top-0 will-change-transform"
          style={{ ...spotlightStyle, backgroundImage: gradient(borderColor) }}
        />
      </div>
      <div
        data-glare-spotlight
        className="pointer-events-none absolute left-0 top-0 will-change-transform"
        style={{ ...spotlightStyle, backgroundImage: gradient(surfaceColor) }}
      />
    </div>
  );
}

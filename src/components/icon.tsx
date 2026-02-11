import type React from "react";
import { tv, type VariantProps } from "tailwind-variants";

export const iconVariants = tv({
  variants: {
    animate: {
      false: "",
      //TODO: leave only true or false if other types of animation is no needed
      spin: "animate-spin",
    },
    size: {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
      xl: "w-10 h-10",
      "2xl": "w-12 h-12",
    },
  },
  defaultVariants: {
    animate: false,
    size: "md",
  },
});

interface IconProps
  extends React.ComponentProps<"svg">,
    VariantProps<typeof iconVariants> {
  svg: React.FC<React.ComponentProps<"svg">>;
}

export default function Icon({
  svg: SvgComponent,
  animate,
  className,
  size,
  ...props
}: IconProps) {
  return (
    <SvgComponent
      className={iconVariants({ animate, size, className })}
      {...props}
    />
  );
}

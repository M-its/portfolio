import type React from "react";
import { tv, type VariantProps } from "tailwind-variants";

export const iconVariants = tv({
  variants: {
    animate: {
      false: "",
      //TODO: leave only true or false if other types of animation is no needed
      spin: "animate-spin",
    },
  },
  defaultVariants: {
    animate: false,
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
  ...props
}: IconProps) {
  return (
    <SvgComponent className={iconVariants({ animate, className })} {...props} />
  );
}

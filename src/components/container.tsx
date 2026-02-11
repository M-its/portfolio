import React from "react";
import { tv, type VariantProps } from "tailwind-variants";

export const containerVariants = tv({
  base: "mx-auto px-12",
  variants: {
    size: {
      md: "max-w-7xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

interface ContainerProps
  extends VariantProps<typeof containerVariants>,
    React.ComponentProps<"div"> {
  as?: keyof React.JSX.IntrinsicElements;
}

export default function Container({
  as = "div",
  children,
  className,
  ...props
}: ContainerProps) {
  return React.createElement(
    as,
    {
      className: containerVariants({ size: "md", className }),
      ...props,
    },
    children,
  );
}

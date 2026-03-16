import React, { forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

export const textVariants = tv({
  base: "font-sans",
  variants: {
    variant: {
      "label-header": "text-sm font-semibold",
      "heading-hero": "text-3xl font-bold leading-tight",
      "heading-section": "text-xl font-bold leading-snug",
      subtitle: "text-lg font-extralight tracking-wide",
      "paragraph-medium": "text-lg font-normal leading-relaxed",
      "paragraph-card": "text-normal font-normal leading-relaxed",
      "button-label": "text-sm font-medium",
      "tech-label": "text-sm font-medium",
    },
  },
  defaultVariants: {
    variant: "paragraph-medium",
  },
});

interface TextProps
  extends VariantProps<typeof textVariants>,
    React.HTMLAttributes<HTMLElement> {
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  children?: React.ReactNode;
}

const Text = forwardRef<HTMLElement, TextProps>(
  ({ as = "span", variant, className, children, ...props }, ref) => {
    return React.createElement(
      as,
      {
        className: textVariants({ variant, className }),
        ref,
        ...props,
      },
      children,
    );
  },
);

export default Text;

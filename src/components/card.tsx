import { type VariantProps, tv } from "tailwind-variants";
import React from "react";

export const cardVariants = tv({
  base: `transform-style-3d
		rounded transition
	`,
  variants: {
    variant: {
      default: "bg-btn-primary-bg border border-btn-primary-bg-hover",
      primary: "bg-btn-secondary-bg",
    },
    size: {
      none: "",
      md: "py-4 px-5",
      lg: "p-6",
    },
  },
  defaultVariants: {
    size: "none",
    variant: "default",
  },
});

interface CardProps
  extends VariantProps<typeof cardVariants>,
    React.ComponentProps<"div"> {
  as?: keyof React.JSX.IntrinsicElements;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ as = "div", size, variant, children, className, ...props }, ref) => {
    return React.createElement(
      as,
      {
        ref,
        className: cardVariants({ size, variant, className }),
        ...props,
      },
      children,
    );
  },
);

Card.displayName = "Card";

export default Card;

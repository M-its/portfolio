import type React from "react";
import Icon from "./icon";
import { tv, type VariantProps } from "tailwind-variants";

export const buttonIconVariants = tv({
  base: "inline-flex items-center justify-center cursor pointer transition cursor-pointer",
  variants: {
    variant: {
      primary: "bg-transparent",
      secondary:
        "bg-btn-primary-bg hover:bg-btn-primary-bg-hover p-2 rounded-full",
    },
    size: {
      md: "w-7 h-7",
      lg: "w-12 h-12",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export const buttonIconIconVariants = tv({
  variants: {
    variant: {
      primary: "fill-fill-icon-button hover:fill-fill-icon-button-hover",
      secondary: "fill-btn-primary-text",
    },
    size: {
      md: "w-8 h-8",
      lg: "w-12 h-12",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

interface ButtonIconProps
  extends VariantProps<typeof buttonIconVariants>,
    Omit<React.ComponentProps<"button">, "size"> {
  icon: React.ComponentProps<typeof Icon>["svg"];
}

export default function ButtonIcon({
  variant,
  size,
  className,
  icon,
  ...props
}: ButtonIconProps) {
  return (
    <button
      className={buttonIconVariants({
        variant,
        size,
        className,
      })}
      {...props}
    >
      <Icon svg={icon} className={buttonIconIconVariants({ variant, size })} />
    </button>
  );
}

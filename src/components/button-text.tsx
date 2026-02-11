import Icon from "./icon";
import Text from "./text";
import { tv, type VariantProps } from "tailwind-variants";

export const buttonTextVariants = tv({
  base: "inline-flex items-center gap-1 transition",
  variants: {
    variant: {
      primary: "bg-transparent",
      secondary: "",
    },
    size: {
      md: "text-base",
      lg: "text-2xl",
      xl: "text-3xl",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "lg",
  },
});

export const buttonTextIconVariants = tv({
  variants: {
    variant: {
      primary: "fill-icon-primary",
      secondary: "",
    },
    size: {
      md: "w-4 h-4",
      lg: "w-8 h-8",
      xl: "w-10 h-10",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "lg",
  },
});

export const buttonTextLabelVariants = tv({
  variants: {
    variant: {
      primary:
        "text-icon-primary font-medium cursor-pointer hover:brightness-150",
      secondary:
        "text-btn-primary-text font-light cursor-pointer hover:brightness-150",
    },
    size: {
      md: "text-base",
      lg: "text-2xl",
      xl: "text-3xl font-bold leading-tight",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "lg",
  },
});

interface ButtonTextProps
  extends VariantProps<typeof buttonTextVariants>,
    Omit<React.ComponentProps<"button">, "size"> {
  icon?: React.ComponentProps<typeof Icon>["svg"];
  children: React.ReactNode;
  className?: string;
}

export default function ButtonText({
  variant,
  size,
  className,
  icon,
  children,
  ...props
}: ButtonTextProps) {
  return (
    <button
      className={buttonTextVariants({
        variant,
        size,
        className,
      })}
      {...props}
    >
      {icon && (
        <Icon
          svg={icon}
          className={buttonTextIconVariants({ variant, size })}
        />
      )}
      <Text as="span" className={buttonTextLabelVariants({ variant, size })}>
        {children}
      </Text>
    </button>
  );
}

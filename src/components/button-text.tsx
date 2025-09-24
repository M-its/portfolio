import Icon from "./icon";
import Text from "./text";
import { tv, type VariantProps } from "tailwind-variants";

export const buttonTextVariants = tv({
  base: "inline-flex items-center gap-1 cursor-pointer transition",
  variants: {
    variant: {
      primary: "bg-transparent",
    },
    size: {
      md: "text-base",
      lg: "text-2xl",
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
    },
    size: {
      md: "w-4 h-4",
      lg: "w-8 h-8",
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
      primary: "text-icon-primary font-medium",
    },
    size: {
      md: "text-base",
      lg: "text-2xl",
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

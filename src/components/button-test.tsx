import Icon from "./icon";
import Text from "./text";
import { tv, type VariantProps } from "tailwind-variants";

export const buttonVariants = tv({
  base: "inline-flex items-center justify-center gap-1 cursor-pointer transition",
  variants: {
    variant: {
      primary: "bg-transparent",
      secondary:
        "bg-btn-primary-bg hover:bg-btn-primary-bg-hover p-2 rounded-full ",
    },
    size: {
      md: "text-base px-4 py-2",
      lg: "text-2xl px-3 py-2",
    },
    mode: {
      icon: "rounded-full",
      text: "rounded",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
    mode: "icon",
  },
});

export const buttonIconVariants = tv({
  variants: {
    variant: {
      primary: "fill-fill-icon-button",
      secondary: "fill-btn-primary-text",
    },
    size: {
      md: "w-4 h-4",
      lg: "w-6 h-6",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export const buttonTextLabelVariants = tv({
  variants: {
    variant: {
      primary: "text-icon-primary",
      secondary: "text-btn-primary-text",
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

interface ButtonProps
  extends VariantProps<typeof buttonVariants>,
    Omit<React.ComponentProps<"button">, "size"> {
  icon?: React.ComponentProps<typeof Icon>["svg"];
  children?: React.ReactNode;
}

export default function ButtonTest({
  variant,
  size,
  mode,
  className,
  icon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, mode, className })}
      {...props}
    >
      {icon && (
        <Icon svg={icon} className={buttonIconVariants({ variant, size })} />
      )}
      {mode === "text" && children && (
        <Text as="span" className={buttonTextLabelVariants({ variant, size })}>
          {children}
        </Text>
      )}
    </button>
  );
}

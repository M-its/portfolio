import Icon from "./icon";
import Text from "./text";
import { tv, type VariantProps } from "tailwind-variants";

const buttonVariants = tv({
  base: `
    flex items-center justify-center cursor-pointer gap-2
    font-medium rounded-md transition-colors shadow-sm
  `,
  variants: {
    variant: {
      primary: `
        bg-btn-primary-bg 
        hover:bg-btn-primary-bg-hover
      `,
      secondary: `
        bg-btn-secondary-bg text-btn-secondary-text
        hover:bg-btn-secondary-bg-hover
      `,
    },
    size: {
      md: "h-10 px-4 py-5",
      lg: "h-12 px-10 py-6",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export const buttonTextVariants = tv({
  variants: {
    variant: {
      primary: "text-btn-primary-text",
      secondary: "text-btn-secondary-text",
    },
    size: {
      md: "text-xl",
      lg: "text-2xl",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export const buttonIconVariants = tv({
  variants: {
    variant: {
      primary: "fill-btn-primary-text",
      secondary: "fill-label",
    },
    size: {
      md: "w-6 h-6",
      lg: "w-7 h-7",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

interface ButtonProps
  extends Omit<React.ComponentProps<"button">, "size">,
    VariantProps<typeof buttonVariants> {
  icon?: React.ComponentProps<typeof Icon>["svg"];
}

export default function Button({
  variant,
  size,
  className,
  children,
  icon,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonVariants({
        variant,
        size,
        className,
      })}
      {...props}
    >
      {icon && (
        <Icon
          svg={icon}
          className={buttonIconVariants({
            variant,
            size,
          })}
        />
      )}
      <Text
        variant="button-label"
        className={buttonTextVariants({
          variant,
          size,
        })}
      >
        {children}
      </Text>
    </button>
  );
}

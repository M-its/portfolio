import Icon from "./icon";
import Text from "./text";
import { tv, type VariantProps } from "tailwind-variants";
import type React from "react";

const buttonVariants = tv({
  base: `
    group relative isolate flex items-center justify-center gap-2
    cursor-pointer rounded-md shadow-sm overflow-hidden
    transition duration-200 ease-out
    hover:-translate-y-px active:translate-y-0
  `,
  variants: {
    variant: {
      primary: `
        bg-btn-primary-bg text-btn-primary-text
        hover:bg-btn-primary-bg-hover
      `,
      secondary: `
        bg-btn-secondary-bg text-btn-secondary-text
        hover:bg-btn-secondary-bg-hover
        hover:shadow-[0_0_10px_2px_hsla(44,72%,82%,0.5)]
      `,
      outline: `
        bg-transparent
      `,
    },
    size: {
      md: "px-4 py-1",
      lg: "px-10 py-1",
      xl: "p-2",
    },
    mode: {
      button: `
        before:content-[''] before:absolute before:top-0 before:-translate-x-full
        before:w-full before:h-full before:bg-linear-to-r
        before:from-transparent before:via-white/10 before:to-transparent
        before:transition-transform before:duration-1000 before:will-change-transform
        group-hover:before:translate-x-full`,
      icon: "bg-transparent p-0 shadow-none hover:shadow:none",
      text: "bg-transparent hover:bg-transparent shadow-none p-0 inline-flex w-max",
    },
    align: {
      center: "justify-center",
      left: "justify-start",
      right: "justify-end",
    },
  },
  compoundVariants: [
    {
      variant: "primary",
      mode: "button",
      class: "border border-btn-primary-bg-hover hover:border-btn-primary-bg",
    },
    {
      variant: "secondary",
      mode: "button",
      class:
        "border border-btn-secondary-bg-hover hover:border-btn-secondary-bg",
    },
    {
      variant: "outline",
      mode: "button",
      class: `
        border border-btn-primary-bg/40
        hover:bg-btn-primary-bg/5 hover:border-btn-primary-bg/80
      `,
    },
    {
      mode: "icon",
      variant: "primary",
      class: "bg-transparent hover:bg-transparent",
    },
    {
      mode: "icon",
      variant: "secondary",
      class: "bg-transparent text-btn-secondary-text hover:bg-transparent",
    },
  ],
  defaultVariants: {
    variant: "primary",
    size: "md",
    mode: "button",
    align: "center",
  },
});

export const buttonTextVariants = tv({
  variants: {
    variant: {
      primary: "text-btn-primary-text",
      secondary: "text-btn-secondary-text",
      outline: "text-text-primary dark:text-btn-primary-text",
    },
    size: {
      md: "text-xl font-light tracking-wide",
      lg: "text-2xl tracking-wider",
      xl: "text-3xl font-light leading-tight tracking-wider",
    },
    mode: {
      button: "font-medium",
      icon: "font-medium",
      text: "",
    },
  },
  compoundVariants: [
    {
      variant: "primary",
      mode: "text",
      class: "text-icon-primary",
    },
    {
      variant: "secondary",
      mode: "text",
      class: "text-btn-primary-text",
    },
  ],
  defaultVariants: {
    variant: "primary",
    size: "md",
    mode: "button",
  },
});

export const buttonIconWrapperVariants = tv({
  base: "inline-flex items-center justify-center transition rounded-full",
  variants: {
    variant: {
      primary: "bg-transparent p-0",
      secondary:
        "bg-btn-primary-bg hover:bg-btn-primary-bg-hover p-2 rounded-full",
    },
    size: {
      md: "w-7 h-7",
      lg: "w-10 h-10",
      xl: "w-12 h-12",
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
      primary: "fill-icon-primary",
      secondary: "",
    },
    size: {
      md: "w-6 h-6",
      lg: "w-9 h-9",
      xl: "w-12 h-12",
    },
    mode: {
      button: "fill-btn-primary-text",
      icon: "",
      text: "",
    },
  },
  compoundVariants: [
    {
      mode: "icon",
      variant: "secondary",
      class: "fill-btn-primary-text p-1",
    },
  ],
  defaultVariants: {
    variant: "primary",
    size: "md",
    mode: "button",
  },
});

type AsProp<T extends React.ElementType> = {
  as?: T;
  icon?: React.ComponentProps<typeof Icon>["svg"];
  iconVariant?: VariantProps<typeof buttonIconWrapperVariants>["variant"];
  mode?: "button" | "icon" | "text";
  align?: "center" | "left" | "right";
} & VariantProps<typeof buttonVariants>;

type PolymorphicProps<T extends React.ElementType> = AsProp<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof AsProp<T>>;

export default function Button<T extends React.ElementType = "button">({
  as,
  icon,
  variant,
  iconVariant = "primary",
  size,
  mode = "button",
  align = "center",
  className,
  children,
  ...props
}: PolymorphicProps<T>) {
  const Component = as || "button";

  return (
    <Component
      className={buttonVariants({ variant, size, mode, align, className })}
      {...(Component === "button" ? { type: "button" } : {})}
      {...props}
    >
      {icon && (
        <span
          className={buttonIconWrapperVariants({
            variant: iconVariant,
            size,
          })}
          aria-hidden
        >
          <Icon
            svg={icon}
            className={buttonIconVariants({
              variant: iconVariant,
              size,
              mode,
            })}
          />
        </span>
      )}

      {children && (
        <Text className={buttonTextVariants({ variant, size, mode })}>
          {children}
        </Text>
      )}
    </Component>
  );
}

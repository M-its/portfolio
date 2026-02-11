import type React from "react";
import Text from "./text";
import { tv, type VariantProps } from "tailwind-variants";
import cx from "classnames";
import Skeleton from "./skeleton";

export const tagVariants = tv({
  base: "inline-flex items-center justify-center rounded-full border border-card-border-variant",
  variants: {
    variant: {
      none: "",
      primary: "bg-btn-primary-bg",
      secondary: "bg-btn-secondary-bg",
    },
    size: {
      sm: "py-1 px-3 h-6",
      md: "py-2 px-3 h-8",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "sm",
  },
});

export const tagTextVariants = tv({
  base: "whitespace-nowrap",
  variants: {
    variant: {
      none: "",
      primary: "text-btn-primary-text",
      secondary: "text-btn-secondary-text",
    },
    size: {
      sm: "text-xs",
      md: "text-sm",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "sm",
  },
});

export const tagSkeletonVariants = tv({
  variants: {
    size: {
      sm: "w-20 h-6",
      md: "w-24 h-6",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

interface TagProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof tagVariants> {
  loading?: boolean;
}

export default function Tag({
  variant,
  size,
  className,
  children,
  loading,
  ...props
}: TagProps) {
  if (loading) {
    return (
      <Skeleton
        rounded="full"
        className={cx(
          tagVariants({ variant: "none" }),
          tagSkeletonVariants({ size }),
          className,
        )}
      />
    );
  }

  return (
    <div className={tagVariants({ variant, size, className })} {...props}>
      <Text className={tagTextVariants({ variant, size })}>{children}</Text>
    </div>
  );
}

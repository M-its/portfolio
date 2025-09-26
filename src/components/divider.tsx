import { tv, type VariantProps } from "tailwind-variants";

export const dividerVariants = tv({
  base: "w-11/12 h-px",
  variants: {
    variant: {
      default: "bg-fill-icon-button",
    },
    orientation: {
      horizontal: "w-11/12 h-px",
      vertical: "w-px h-11/12",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface DividerProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof dividerVariants> {
  orientation?: "horizontal" | "vertical";
}

export default function Divider({
  className,
  orientation = "horizontal",
  ...props
}: DividerProps) {
  return (
    <div className={dividerVariants({ orientation, className })} {...props} />
  );
}

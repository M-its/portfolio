import React, { forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

export const textVariants = tv({
  base: "font-sans",
  variants: {
    variant: {
      "label-header": "text-sm font-semibold", // Nome
      "heading-hero": "text-3xl font-bold leading-tight", // Bem Vindo
      "heading-section": "text-2xl font-bold leading-snug", // Tecnologias | projetos
      subtitle: "text-lg font-extralight tracking-wide",
      "paragraph-medium": "text-lg font-normal leading-relaxed", // texto padrão
      "paragraph-card": "text-normal font-normal leading-relaxed",
      "button-label": "text-sm font-medium", // Botões de redes sociais
      "tech-label": "text-sm font-medium", // cards de tecnologias
    },
  },
  defaultVariants: {
    variant: "paragraph-medium",
  },
});

interface TextProps extends VariantProps<typeof textVariants> {
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

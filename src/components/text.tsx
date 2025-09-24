import React from "react";
import { tv, type VariantProps } from "tailwind-variants";

export const textVariants = tv({
  base: "font-sans",
  variants: {
    variant: {
      "label-header": "text-sm font-semibold", // Nome
      "heading-hero": "text-3xl font-bold leading-tight", // Bem Vindo
      "heading-section": "text-xl font-bold leading-snug", // Tecnologias | projetos
      subtitle: "text-lg font-medium",
      "paragraph-medium": "text-base font-normal leading-relaxed", // texto padrão
      "button-label": "text-sm font-semibold", // Botões de redes sociais
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

export default function Text({
  as = "span",
  variant,
  className,
  children,
  ...props
}: TextProps) {
  return React.createElement(
    as,
    {
      className: textVariants({ variant, className }),
      props,
    },
    children,
  );
}

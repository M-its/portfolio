import { motion, type Variants } from "framer-motion";
import { useOnScreen } from "../hooks/useOnScreen";

const defaultVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

interface AnimatedSectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  delay?: number;
  variants?: Variants;
  viewport?: {
    once?: boolean;
    margin?: string;
    amount?: "some" | "all" | number;
  };
  animateOnMount?: boolean;
  repeatOnView?: boolean;
  as?: keyof typeof motion;
}

export const animationVariants: Record<string, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  },
  blur: {
    hidden: { opacity: 0, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 0.4, ease: "easeOut" },
    },
  },
};

function mergeVariantsWithDelay(variants: Variants, delay: number): Variants {
  const visible = variants.visible;

  if (typeof visible !== "object") return variants;

  return {
    ...variants,
    visible: {
      ...visible,
      transition: {
        ...(visible.transition || {}),
        delay,
      },
    },
  };
}

export default function AnimatedSection({
  children,
  id,
  className = "",
  delay = 0,
  variants = defaultVariants,
  viewport = { once: true, margin: "-100px" },
  animateOnMount = false,
  repeatOnView = false,
  as = "section",
}: AnimatedSectionProps) {
  const Component = motion[as] as React.ElementType;
  const mergedVariants = mergeVariantsWithDelay(variants, delay);

  let threshold: number | number[] = 0;
  if (typeof viewport.amount === "number") {
    threshold = viewport.amount;
  } else if (viewport.amount === "all") {
    threshold = 1;
  } else {
    threshold = 0;
  }

  const triggerOnce = !repeatOnView && viewport.once !== false;

  const [ref, isVisible] = useOnScreen({
    threshold,
    rootMargin: viewport.margin,
    triggerOnce,
  });

  const animationProps = animateOnMount
    ? {
        initial: "hidden",
        animate: "visible",
        variants: mergedVariants,
      }
    : {
        initial: "hidden",
        animate: isVisible ? "visible" : "hidden",
        variants: mergedVariants,
      };

  return (
    <Component id={id} className={className} ref={ref} {...animationProps}>
      {children}
    </Component>
  );
}

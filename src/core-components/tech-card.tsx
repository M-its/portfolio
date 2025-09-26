import type React from "react";
import { useRef, useEffect } from "react";
import VanillaTilt from "vanilla-tilt";
import Card from "../components/card";

interface TechCardProps extends React.ComponentProps<typeof Card> {
  tiltOptions?: Parameters<typeof VanillaTilt.init>[1];
}

type TiltElement = HTMLDivElement & {
  vanillaTilt?: {
    destroy: () => void;
  };
};

export default function TechCard({
  size,
  variant,
  tiltOptions,
  children,
  className,
  ...props
}: TechCardProps) {
  const tiltRef = useRef<TiltElement>(null);

  useEffect(() => {
    if (tiltRef.current) {
      VanillaTilt.init(tiltRef.current, {
        max: 15,
        scale: 1.05,
        speed: 300,
        glare: true,
        reverse: true,
        "max-glare": 0.2,
        ...tiltOptions,
      });
    }
    return () => {
      tiltRef.current?.vanillaTilt?.destroy();
    };
  }, [tiltOptions]);

  return (
    <div ref={tiltRef} className=" bg-transparent cursor-pointer">
      <Card size={size} variant={variant} className={className} {...props}>
        {children}
      </Card>
    </div>
  );
}

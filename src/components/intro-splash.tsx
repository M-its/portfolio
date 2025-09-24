import { motion } from "framer-motion";
import Icon from "./icon";
import LogoIcon from "../assets/images/logo-plain.svg?react";

interface IntroSplashProps {
  onFinish: () => void;
}

export default function IntroSplash({ onFinish }: IntroSplashProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0 }}
      className="flex h-screen w-screen flex-col items-center justify-center bg-transparent"
    >
      <Icon svg={LogoIcon} className="fill-icon-primary" />
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0 }}
        className="mt-4 h-1 w-32 origin-left bg-white"
        onAnimationComplete={onFinish}
      />
    </motion.div>
  );
}

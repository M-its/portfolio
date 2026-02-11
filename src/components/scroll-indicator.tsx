import { motion } from "framer-motion";
import { useState } from "react";
import ArrowDownIcon from "../assets/icons/arrow-down.svg?react";
import Icon from "./icon";
import Text from "./text";

const MotionText = motion.create(Text);

export default function ScrollIndicator({ onClick }: { onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        opacity: isHovered ? 1 : [1, 0.5, 1],
      }}
      transition={{
        duration: 2,
        repeat: isHovered ? 0 : Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
      className="flex flex-col items-center justify-center w-fit mx-auto cursor-pointer"
    >
      <div className="overflow-hidden flex flex-col items-center pb-2">
        <motion.div
          animate={{ y: isHovered ? 26 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1"
        >
          <MotionText
            variant="button-label"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`uppercase tracking-widest font-display font-medium ${
              isHovered ? "text-text-primary-bg" : "text-text-primary/80"
            }`}
          >
            Scroll for more
          </MotionText>
          <motion.div
            animate={{
              y: isHovered ? 0 : [0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: isHovered ? 0 : Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className={`transition-colors ${
              isHovered ? "text-btn-secondary-bg" : "text-text-primary/80"
            }`}
          >
            <Icon svg={ArrowDownIcon} size="md" />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

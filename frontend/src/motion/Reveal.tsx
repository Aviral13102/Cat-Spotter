import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { fadeUp } from './variants';
import { useMotionPrefs } from './useMotionPrefs';
import { dur } from './tokens';

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  delay?: number;
}

export function Reveal({ children, delay = 0, ...props }: RevealProps) {
  const { isReduced } = useMotionPrefs();

  return (
    <motion.div
      variants={isReduced ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: dur.instant, delay } },
        exit: { opacity: 0, transition: { duration: dur.instant } },
      } : {
        ...fadeUp,
        animate: {
          ...(typeof fadeUp.animate === 'object' ? fadeUp.animate : {}),
          transition: {
            ...((typeof fadeUp.animate === 'object' && fadeUp.animate && 'transition' in fadeUp.animate ? fadeUp.animate.transition : {}) as object),
            delay
          }
        },
      }}
      initial="initial"
      animate="animate"
      exit="exit"
      {...props}
    >
      {children}
    </motion.div>
  );
}

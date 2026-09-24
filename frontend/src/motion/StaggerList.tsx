import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, Children, isValidElement } from 'react';
import { stagger, dur } from './tokens';
import { listItem } from './variants';
import { useMotionPrefs } from './useMotionPrefs';

interface StaggerListProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerList({ children, staggerDelay = stagger.list, className = '' }: StaggerListProps) {
  const { isReduced } = useMotionPrefs();

  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        animate: {
          transition: {
            staggerChildren: isReduced ? 0 : staggerDelay,
          },
        },
      }}
    >
      <AnimatePresence mode="popLayout">
        {Children.map(children, (child) => {
          if (!isValidElement(child)) return child;
          return (
            <motion.div
              key={child.key}
              variants={isReduced ? {
                initial: { opacity: 0 },
                animate: { opacity: 1, transition: { duration: dur.instant } },
                exit: { opacity: 0, transition: { duration: dur.instant } },
              } : listItem}
              layout={!isReduced}
            >
              {child}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}

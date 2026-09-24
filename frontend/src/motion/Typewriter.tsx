import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { dur } from './tokens';
import { useMotionPrefs } from './useMotionPrefs';

interface TypewriterProps {
  text: string;
  speed?: number; // characters per second
  onComplete?: () => void;
  className?: string;
}

export function Typewriter({ text, speed = 30, onComplete, className = '' }: TypewriterProps) {
  const { isReduced } = useMotionPrefs();
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isReduced) {
      setDisplayText(text);
      setIsComplete(true);
      onComplete?.();
      return;
    }

    setDisplayText('');
    setIsComplete(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [text, speed, isReduced, onComplete]);

  const skipToEnd = useCallback(() => {
    setDisplayText(text);
    setIsComplete(true);
    onComplete?.();
  }, [text, onComplete]);

  return (
    <motion.span
      className={className}
      onClick={!isComplete ? skipToEnd : undefined}
      style={{ cursor: !isComplete ? 'pointer' : 'default' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: dur.fast }}
    >
      {displayText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          style={{ marginLeft: 1 }}
        >
          █
        </motion.span>
      )}
    </motion.span>
  );
}

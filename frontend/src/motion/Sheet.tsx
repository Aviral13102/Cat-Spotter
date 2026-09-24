import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useEffect } from 'react';
import { spring, dur, ease } from './tokens';
import { useMotionPrefs } from './useMotionPrefs';
import { X } from 'lucide-react';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Sheet({ isOpen, onClose, title, children }: SheetProps) {
  const { isReduced } = useMotionPrefs();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: isReduced ? dur.instant : dur.fast }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: isReduced ? 'none' : 'blur(8px)',
              WebkitBackdropFilter: isReduced ? 'none' : 'blur(8px)',
              zIndex: 'var(--z-sheet)' as unknown as number,
            }}
            aria-hidden="true"
          />
          {/* Sheet panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={isReduced ? { opacity: 0 } : { x: '100%' }}
            animate={isReduced ? { opacity: 1 } : { x: 0 }}
            exit={isReduced ? { opacity: 0 } : { x: '100%' }}
            transition={isReduced ? { duration: dur.instant } : spring.soft}
            drag={isReduced ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.x > 100) onClose();
            }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(520px, 90vw)',
              background: 'var(--surface)',
              borderLeft: '1px solid var(--border)',
              zIndex: 'calc(var(--z-sheet) + 1)' as unknown as number,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--sp-6)',
                borderBottom: '1px solid var(--border)',
                flexShrink: 0,
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-xl)',
                  fontWeight: 700,
                  color: 'var(--cat-yellow)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                }}
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close sheet"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--muted)',
                }}
              >
                <X size={20} />
              </button>
            </div>
            {/* Content */}
            <motion.div
              initial={isReduced ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isReduced ? 0 : 0.15, duration: dur.base }}
              style={{
                flex: 1,
                overflow: 'auto',
                padding: 'var(--sp-6)',
              }}
            >
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

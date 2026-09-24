import { motion } from 'framer-motion';
import { useSpotterStore } from '../store/spotter';
import { useSpeech } from '../voice/useSpeech';
import { handleCommand } from '../voice/commands';
import { useEffect, useRef, useState } from 'react';

export function SpotterOrb({ onClick }: { onClick?: () => void }) {
  const voice = useSpotterStore(state => state.voice);
  const { startListening, stopListening, isListening: sttListening, transcript, isSupported } = useSpeech();
  const [showTranscript, setShowTranscript] = useState(false);
  const transcriptRef = useRef(transcript);
  transcriptRef.current = transcript;

  const isListening = sttListening || voice.listening;
  const isSpeaking = voice.speaking;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        const tag = (e.target as HTMLElement).tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        e.preventDefault();
        setShowTranscript(true);
        startListening();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const tag = (e.target as HTMLElement).tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        stopListening();
        const finalTranscript = transcriptRef.current;
        if (finalTranscript) {
          handleCommand(finalTranscript);
        }
        setTimeout(() => setShowTranscript(false), 3000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [startListening, stopListening]);

  const handleClick = () => {
    if (isListening) {
      stopListening();
      const finalTranscript = transcriptRef.current;
      if (finalTranscript) handleCommand(finalTranscript);
      setTimeout(() => setShowTranscript(false), 3000);
    } else {
      setShowTranscript(true);
      startListening();
    }
    onClick?.();
  };

  let color = 'var(--cat-yellow)';
  if (isListening) color = 'var(--info)';
  if (isSpeaking) color = 'var(--ok)';

  return (
    <div style={{ position: 'fixed', top: '65%', left: 24, transform: 'translateY(-50%)', zIndex: 50 }}>
      {/* Transcript bubble */}
      {showTranscript && transcript && (
        <motion.div
          initial={{ opacity: 0, x: -10, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -10 }}
          style={{
            position: 'absolute', top: 0, left: 90, minWidth: 200, maxWidth: 300,
            padding: 'var(--sp-3) var(--sp-4)', background: 'var(--surface-2)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
            borderTopLeftRadius: 4, boxShadow: 'var(--shadow-lg)',
            color: 'var(--text)', fontSize: 'var(--text-sm)'
          }}
        >
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 4 }}>🎤 You said:</div>
          <div>{transcript}</div>
        </motion.div>
      )}
      
      {/* Orb button */}
      <motion.button
        onClick={handleClick}
        whileTap={{ scale: 0.9 }}
        animate={{
          scale: isListening ? [1, 1.1, 1] : [1, 1.04, 1],
          boxShadow: `0 0 30px ${color}40`,
        }}
        transition={{
          duration: isListening ? 0.8 : 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{
          width: 72, height: 72, borderRadius: '50%', cursor: 'pointer',
          background: color,
          border: 'none', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: '#000', fontSize: '10px', fontWeight: 800,
          fontFamily: 'var(--font-display)', letterSpacing: '0.05em'
        }}
      >
        {isListening ? '🎤' : 'SPOTTER'}
      </motion.button>
      
      {!isSupported && (
        <div style={{ position: 'absolute', bottom: -20, right: 0, fontSize: 10, color: 'var(--warn)' }}>
          Voice not supported
        </div>
      )}
    </div>
  );
}

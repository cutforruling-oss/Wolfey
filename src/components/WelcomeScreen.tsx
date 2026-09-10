import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2 } from 'lucide-react';
import { playSfx, preloadAllSfx } from '../lib/soundManager';

interface WelcomeScreenProps {
  isEntered: boolean;
  onEnter: () => void;
  titleGifsUrl: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  isEntered,
  onEnter,
  titleGifsUrl,
}) => {
  useEffect(() => {
    preloadAllSfx();
  }, []);

  const handleEnterClick = () => {
    playSfx('anime-activate');
    playSfx('click-enter');
    onEnter();
  };

  return (
    <AnimatePresence>
      {!isEntered && (
        <motion.div
          id="welcome-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.08, filter: 'blur(12px)' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleEnterClick}
          className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer select-none"
          style={{
            backgroundColor: 'rgba(5, 5, 12, 0.84)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: [1, 1.025, 1], opacity: 1, y: 0 }}
            transition={{
              scale: { repeat: Infinity, duration: 2.8, ease: 'easeInOut' },
              opacity: { duration: 0.7 },
              y: { duration: 0.7 },
            }}
            className="flex flex-col items-center gap-5 px-6 text-center max-w-lg"
          >
            {/* Top Brand Pill */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono text-sky-200 tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              <span>WOLFEY PORTFOLIO</span>
              <span>•</span>
              <span>🇮🇳 INDIA</span>
            </div>

            {/* Click To Enter Main Display */}
            <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
              <img
                src={titleGifsUrl}
                alt="Animated decoration left"
                width={55}
                height={55}
                className="w-10 h-10 sm:w-14 sm:h-14 object-contain pointer-events-none select-none"
              />
              <span className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white neon-text font-['Plus_Jakarta_Sans']">
                click to enter
              </span>
              <img
                src={titleGifsUrl}
                alt="Animated decoration right"
                width={55}
                height={55}
                className="w-10 h-10 sm:w-14 sm:h-14 object-contain pointer-events-none select-none"
              />
            </div>

            {/* Audio note & prompt */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center gap-2 mt-2"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm text-sky-200 tracking-widest uppercase font-medium">
                <Volume2 size={15} className="text-sky-300 animate-pulse" />
                <span>Audio will play on enter</span>
              </div>
              <p className="text-[11px] text-stone-400 font-mono">
                Click anywhere on the screen to begin
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

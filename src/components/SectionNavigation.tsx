import React from 'react';
import { ActiveTab } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { playSfx, SoundEffectType } from '../lib/soundManager';
import { registerRealClick } from '../lib/firebase';

interface SectionNavigationProps {
  currentTab: ActiveTab;
  onNavigate: (targetTab: ActiveTab) => void;
}

interface NavStep {
  id: ActiveTab;
  label: string;
  sfx: SoundEffectType;
}

const TAB_STEPS: NavStep[] = [
  { id: 'profile', label: 'Profile', sfx: 'nav' },
  { id: 'about', label: 'About Me', sfx: 'about' },
  { id: 'skills', label: 'Skills', sfx: 'skills' },
  { id: 'projects', label: 'Projects', sfx: 'projects' },
  { id: 'gallery', label: 'Gallery', sfx: 'gallery' },
  { id: 'comments', label: 'Comments', sfx: 'comments' },
];

export const SectionNavigation: React.FC<SectionNavigationProps> = ({
  currentTab,
  onNavigate,
}) => {
  const currentIndex = TAB_STEPS.findIndex((s) => s.id === currentTab);
  const total = TAB_STEPS.length;

  const prevIndex = (currentIndex - 1 + total) % total;
  const nextIndex = (currentIndex + 1) % total;

  const prevStep = TAB_STEPS[prevIndex];
  const nextStep = TAB_STEPS[nextIndex];

  // Specific visibility checks matching requirements:
  // - About section -> Next button (and Previous so user never gets stuck)
  // - Main Profile section -> both Previous and Next buttons
  // - Comments section -> Previous button (and Next loop back)
  const showPrev = true; // Always provide seamless bidirectional navigation
  const showNext = true;

  const handlePrev = () => {
    playSfx(prevStep.sfx);
    registerRealClick(`nav_prev_${prevStep.id}`);
    onNavigate(prevStep.id);
  };

  const handleNext = () => {
    playSfx(nextStep.sfx);
    registerRealClick(`nav_next_${nextStep.id}`);
    onNavigate(nextStep.id);
  };

  return (
    <div
      id="section-prev-next-nav"
      className="w-full pt-4 pb-2 px-3 sm:px-4 flex items-center justify-between gap-3 select-none"
    >
      {/* PREVIOUS BUTTON */}
      {showPrev ? (
        <motion.button
          type="button"
          whileHover={{ scale: 1.04, x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrev}
          aria-label={`Go to previous section: ${prevStep.label}`}
          className="group relative flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-black/60 hover:bg-sky-950/50 border border-sky-500/30 hover:border-sky-400 text-sky-200 hover:text-white transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.15)] hover:shadow-[0_0_22px_rgba(56,189,248,0.35)] backdrop-blur-md"
        >
          {/* Cyber pixel corner accents */}
          <span className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-sky-300 pointer-events-none" />
          <span className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-sky-300 pointer-events-none" />

          <ChevronLeft
            size={16}
            className="text-sky-400 group-hover:-translate-x-0.5 transition-transform"
          />
          <div className="flex flex-col items-start text-left">
            <span className="text-[9px] font-mono tracking-wider text-sky-400 uppercase leading-none">
              {prevStep.label}
            </span>
            <span className="text-xs sm:text-sm font-extrabold tracking-wider font-mono">
              ◀ PREVIOUS
            </span>
          </div>
        </motion.button>
      ) : (
        <div />
      )}

      {/* Progress Dots Indicator */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
        {TAB_STEPS.map((step, idx) => (
          <button
            key={step.id}
            onClick={() => {
              playSfx(step.sfx);
              onNavigate(step.id);
            }}
            title={step.label}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              idx === currentIndex
                ? 'w-5 h-2 bg-gradient-to-r from-sky-400 to-pink-400 shadow-[0_0_8px_#38bdf8]'
                : 'w-2 h-2 bg-white/20 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* NEXT BUTTON */}
      {showNext ? (
        <motion.button
          type="button"
          whileHover={{ scale: 1.04, x: 2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          aria-label={`Go to next section: ${nextStep.label}`}
          className="group relative flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-black/60 hover:bg-pink-950/50 border border-pink-500/30 hover:border-pink-400 text-pink-200 hover:text-white transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(236,72,153,0.15)] hover:shadow-[0_0_22px_rgba(236,72,153,0.35)] backdrop-blur-md ml-auto"
        >
          {/* Cyber pixel corner accents */}
          <span className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-pink-300 pointer-events-none" />
          <span className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-pink-300 pointer-events-none" />

          <div className="flex flex-col items-end text-right">
            <span className="text-[9px] font-mono tracking-wider text-pink-400 uppercase leading-none">
              {nextStep.label}
            </span>
            <span className="text-xs sm:text-sm font-extrabold tracking-wider font-mono">
              NEXT ▶
            </span>
          </div>
          <ChevronRight
            size={16}
            className="text-pink-400 group-hover:translate-x-0.5 transition-transform"
          />
        </motion.button>
      ) : (
        <div />
      )}
    </div>
  );
};

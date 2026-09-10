import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import { ActiveTab } from '../types';
import { playSfx } from '../lib/soundManager';
import { registerRealClick } from '../lib/firebase';

export interface SectionMeta {
  id: ActiveTab;
  label: string;
  shortLabel: string;
  japanese: string;
  icon: string;
}

export const SECTIONS_ORDER: SectionMeta[] = [
  { id: 'profile', label: 'MY PROFILE', shortLabel: 'Profile', japanese: 'プロフィール', icon: '👤' },
  { id: 'about', label: 'ABOUT ME', shortLabel: 'About', japanese: '自己紹介', icon: '✨' },
  { id: 'skills', label: 'SKILLS', shortLabel: 'Skills', japanese: 'クリエイティブ', icon: '⚡' },
  { id: 'paidWork', label: 'PAID WORK', shortLabel: 'Paid Work', japanese: '依頼・受注', icon: '💼' },
  { id: 'projects', label: 'PROJECTS', shortLabel: 'Projects', japanese: 'プロジェクト', icon: '📁' },
  { id: 'gallery', label: 'GALLERY', shortLabel: 'Gallery', japanese: 'ギャラリー', icon: '🎨' },
  { id: 'music', label: 'MUSIC', shortLabel: 'Music', japanese: '音楽システム', icon: '🎵' },
  { id: 'comments', label: 'COMMENTS', shortLabel: 'Comments', japanese: '掲示板', icon: '💬' },
];

interface SectionNavigationDockProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab, direction: 'next' | 'prev') => void;
}

export const SectionNavigationDock: React.FC<SectionNavigationDockProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const currentIndex = SECTIONS_ORDER.findIndex((s) => s.id === activeTab);
  const currentSection = SECTIONS_ORDER[currentIndex] || SECTIONS_ORDER[0];

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < SECTIONS_ORDER.length - 1;

  const handlePrev = () => {
    if (!hasPrev) return;
    playSfx('section-prev');
    const target = SECTIONS_ORDER[currentIndex - 1];
    onSelectTab(target.id, 'prev');
    registerRealClick(`nav_section_prev_to_${target.id}`);
  };

  const handleNext = () => {
    if (!hasNext) return;
    playSfx('section-next');
    const target = SECTIONS_ORDER[currentIndex + 1];
    onSelectTab(target.id, 'next');
    registerRealClick(`nav_section_next_to_${target.id}`);
  };

  return (
    <div
      id="section-navigation-dock"
      className="w-full flex items-center justify-between gap-2 p-1.5 sm:p-2 rounded-2xl bg-gradient-to-r from-black/65 via-stone-900/60 to-black/65 border border-sky-400/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(56,189,248,0.15)] mb-3 select-none z-20"
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* PREVIOUS SECTION BUTTON */}
      <motion.button
        whileHover={hasPrev ? { scale: 1.05, x: -2 } : {}}
        whileTap={hasPrev ? { scale: 0.94, y: 1 } : {}}
        onClick={handlePrev}
        disabled={!hasPrev}
        aria-label="Previous Section"
        className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all duration-200 border cursor-pointer ${
          hasPrev
            ? 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border-sky-400/50 shadow-[0_0_15px_rgba(56,189,248,0.25)] active:border-sky-300'
            : 'opacity-25 bg-white/5 text-stone-500 border-white/5 cursor-not-allowed'
        }`}
      >
        <ChevronLeft size={16} className={hasPrev ? 'text-sky-300 animate-pulse' : ''} />
        <span className="hidden xs:inline">PREV</span>
        <span className="xs:hidden">◀</span>
      </motion.button>

      {/* CENTER SECTION NAME & ANIME BADGE */}
      <div className="flex flex-col items-center justify-center px-2 text-center flex-1 min-w-0">
        <div className="flex items-center gap-1.5 justify-center">
          <span className="text-sm">{currentSection.icon}</span>
          <span className="text-xs sm:text-sm font-black text-white tracking-wider font-['Plus_Jakarta_Sans'] truncate">
            {currentSection.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-stone-400 mt-0.5">
          <span className="text-sky-300/80">{currentSection.japanese}</span>
          <span>•</span>
          <span>
            {currentIndex + 1} / {SECTIONS_ORDER.length}
          </span>
        </div>
      </div>

      {/* NEXT SECTION BUTTON */}
      <motion.button
        whileHover={hasNext ? { scale: 1.05, x: 2 } : {}}
        whileTap={hasNext ? { scale: 0.94, y: 1 } : {}}
        onClick={handleNext}
        disabled={!hasNext}
        aria-label="Next Section"
        className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all duration-200 border cursor-pointer ${
          hasNext
            ? 'bg-gradient-to-r from-sky-500/25 to-pink-500/25 hover:from-sky-500/35 hover:to-pink-500/35 text-sky-100 border-pink-400/50 shadow-[0_0_15px_rgba(244,114,182,0.25)] active:border-pink-300'
            : 'opacity-25 bg-white/5 text-stone-500 border-white/5 cursor-not-allowed'
        }`}
      >
        <span className="hidden xs:inline">NEXT</span>
        <span className="xs:hidden">▶</span>
        <ChevronRight size={16} className={hasNext ? 'text-pink-300 animate-pulse' : ''} />
      </motion.button>
    </div>
  );
};

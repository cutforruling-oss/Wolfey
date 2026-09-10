import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { ActiveTab } from '../../types';
import {
  User,
  Info,
  Code2,
  FolderGit2,
  Image,
  MessageSquare,
  Wrench,
  Music,
  Film,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { registerRealClick } from '../../lib/firebase';
import { playSfx, SoundEffectType } from '../../lib/soundManager';

interface TabNavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  commentsCount: number;
  galleryCount: number;
}

interface NavTabItem {
  id: ActiveTab;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  sfx: SoundEffectType;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onSelectTab,
  commentsCount,
  galleryCount,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Exactly 7 navigation sections: MY PROFILE → ABOUT ME → SKILLS → PROJECTS → GALLERY → MUSIC → COMMENTS
  const tabs: NavTabItem[] = [
    { id: 'profile', label: 'MY PROFILE', icon: <User size={16} />, sfx: 'nav' },
    { id: 'about', label: 'ABOUT ME', icon: <Info size={16} />, sfx: 'about' },
    { id: 'skills', label: 'SKILLS', icon: <Code2 size={16} />, sfx: 'skills' },
    { id: 'paidWork', label: 'PAID WORK', icon: <Briefcase size={16} />, sfx: 'nav' },
    { id: 'projects', label: 'PROJECTS', icon: <FolderGit2 size={16} />, sfx: 'projects' },
    { id: 'gallery', label: 'GALLERY', icon: <Image size={16} />, badge: galleryCount, sfx: 'gallery' },
    { id: 'music', label: 'MUSIC', icon: <Music size={16} />, sfx: 'music-play' },
    { id: 'comments', label: 'COMMENTS', icon: <MessageSquare size={16} />, badge: commentsCount, sfx: 'comments' },
  ];

  // Monitor and update scroll indicators
  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 2) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      setScrollProgress(0);
      return;
    }

    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft < maxScroll - 6);
    setScrollProgress(Math.min(1, Math.max(0, el.scrollLeft / maxScroll)));
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [updateScrollState]);

  // Ensure MY PROFILE is front and center on start or when profile is selected
  useEffect(() => {
    if (activeTab === 'profile' && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      setTimeout(updateScrollState, 300);
      return;
    }

    const activeBtn = tabButtonRefs.current[activeTab];
    if (activeBtn && scrollContainerRef.current) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
      setTimeout(updateScrollState, 320);
    }
  }, [activeTab, updateScrollState]);

  const handleTabClick = (tabId: ActiveTab, sfx: SoundEffectType) => {
    playSfx(sfx);
    onSelectTab(tabId);
    registerRealClick(`nav_tab_${tabId}`);
  };

  const scrollByAmount = (offset: number) => {
    if (scrollContainerRef.current) {
      playSfx('scroll');
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(updateScrollState, 300);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current && Math.abs(e.deltaY) > 0) {
      scrollContainerRef.current.scrollLeft += e.deltaY * 0.9;
      updateScrollState();
    }
  };

  return (
    <nav
      id="tab-navigation-bar"
      aria-label="Works & Profile Navigation"
      className="relative w-full rounded-2xl bg-black/75 border border-sky-400/40 backdrop-blur-2xl shadow-[0_16px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(56,189,248,0.2)] mb-3 z-20 p-2 sm:p-2.5 flex flex-col"
    >
      {/* Top Bar with Micro Scroll Arrows for complete responsiveness & 0% cropping */}
      <div className="relative w-full flex items-center">
        {/* Left Scroll Arrow (Illuminates when scrollable left) */}
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scrollByAmount(-220)}
            className="absolute left-0 z-30 flex items-center justify-center w-8 sm:w-9 h-11 sm:h-12 rounded-l-xl bg-gradient-to-r from-black via-black/95 to-transparent text-sky-300 hover:text-white border-l border-sky-400/50 transition-colors shadow-[-4px_0_15px_rgba(56,189,248,0.4)] cursor-pointer"
            aria-label="Scroll Navigation Left"
          >
            <ChevronLeft size={18} className="animate-pulse" />
          </motion.button>
        )}

        {/* Scrollable Container with Spacious Sizing and Zero Clipping */}
        <div
          ref={scrollContainerRef}
          onScroll={updateScrollState}
          onWheel={handleWheel}
          className="w-full flex items-center justify-start gap-1.5 sm:gap-2.5 overflow-x-auto overflow-y-hidden py-1.5 px-2 custom-scrollbar anime-nav-scroller select-none"
          style={{
            scrollbarWidth: 'thin',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                ref={(el) => {
                  tabButtonRefs.current[tab.id] = el;
                }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.95, y: 1 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                onClick={() => handleTabClick(tab.id, tab.sfx)}
                className={`group relative flex items-center justify-center gap-2 px-3.5 sm:px-4.5 py-2.5 sm:py-3 min-h-[48px] sm:min-h-[52px] rounded-xl text-xs sm:text-[13px] md:text-sm font-bold font-['Plus_Jakarta_Sans'] tracking-wider transition-all duration-200 cursor-pointer shrink-0 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-sky-500/40 via-indigo-500/35 to-pink-500/40 border border-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.55),inset_0_1px_1px_rgba(255,255,255,0.45)]'
                    : 'text-stone-200 hover:text-white hover:bg-white/10 border border-white/10 hover:border-sky-400/40 hover:shadow-[0_0_18px_rgba(56,189,248,0.25)]'
                }`}
              >
                {/* Light Sweep Shimmer Animation Overlay */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                {/* Cyber Corner Accents on Active */}
                {isActive && (
                  <>
                    <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-300 pointer-events-none" />
                    <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-pink-300 pointer-events-none" />
                  </>
                )}

                {/* Icon with subtle Anime Rotation/Glow on hover */}
                <span
                  className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]' : 'text-stone-300 group-hover:text-sky-300'
                  }`}
                >
                  {tab.icon}
                </span>

                {/* Label with Anime Typography — ALWAYS FULLY VISIBLE, NEVER TRUNCATED */}
                <span
                  className={`whitespace-nowrap font-bold tracking-wide transition-colors ${
                    isActive
                      ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                      : 'group-hover:text-white'
                  }`}
                >
                  {tab.label}
                </span>

                {/* Badge Counter */}
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 transition-all ${
                      isActive
                        ? 'bg-cyan-400/30 text-cyan-100 border border-cyan-400/60 shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                        : 'bg-white/10 text-stone-200 group-hover:bg-white/20'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}

                {/* Glowing Laser Bottom Indicator on Active Tab */}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent rounded-full shadow-[0_0_12px_#38bdf8]"
                  />
                )}

                {/* Pulsing Micro Energy Dot on Active Tab */}
                {isActive && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8] animate-ping" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Right Scroll Arrow (Illuminates when scrollable right) */}
        {canScrollRight && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scrollByAmount(220)}
            className="absolute right-0 z-30 flex items-center justify-center w-8 sm:w-9 h-11 sm:h-12 rounded-r-xl bg-gradient-to-l from-black via-black/95 to-transparent text-pink-300 hover:text-white border-r border-pink-400/50 transition-colors shadow-[4px_0_15px_rgba(244,114,182,0.4)] cursor-pointer"
            aria-label="Scroll Navigation Right"
          >
            <ChevronRight size={18} className="animate-pulse" />
          </motion.button>
        )}
      </div>

      {/* PREMIUM ANIME-STYLE CUSTOM SCROLLER TRACK & PROGRESS THUMB */}
      <div className="w-full px-3 pt-1.5 pb-0.5 flex items-center gap-2">
        <div className="relative w-full h-[4px] rounded-full bg-stone-800/80 overflow-hidden border border-white/10">
          <motion.div
            className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-pink-500 shadow-[0_0_10px_rgba(56,189,248,0.8)]"
            style={{
              width: '28%',
              left: `${scrollProgress * 72}%`,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>
      </div>
    </nav>
  );
};

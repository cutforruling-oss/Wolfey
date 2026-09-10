import React from 'react';
import { motion } from 'motion/react';
import { Play, Check, ChevronLeft, ChevronRight, Film, ExternalLink } from 'lucide-react';
import { BACKGROUND_VIDEOS, PLAYLIST_URL } from '../../data/backgroundVideos';
import { useBackground } from '../../context/BackgroundContext';
import { playSfx } from '../../lib/soundManager';

export const BackgroundTab: React.FC = () => {
  const { currentBgIndex, setBgIndex, nextBg, prevBg, isTransitioning } = useBackground();

  const currentVideo = BACKGROUND_VIDEOS[currentBgIndex] || BACKGROUND_VIDEOS[0];

  return (
    <div id="background-selection-section" className="flex flex-col gap-5 w-full">
      {/* Header with Anime Aesthetic */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-sky-400/20 text-sky-300 border border-sky-400/35">
              <Film size={16} />
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-wide font-['Plus_Jakarta_Sans'] flex items-center gap-2">
              <span>CINEMATIC BACKGROUNDS</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                10 SCENES
              </span>
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Carefully curated anime dreamscapes from the official Lo-fi playlist. Strictly visual & muted.
          </p>
        </div>

        {/* External Playlist Source Link */}
        <a
          href={PLAYLIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer inline-flex items-center gap-1.5 text-[11px] font-mono text-sky-300/80 hover:text-sky-200 bg-sky-500/10 hover:bg-sky-500/20 px-2.5 py-1.5 rounded-lg border border-sky-400/20 transition-colors shrink-0"
          title="Open original playlist on YouTube"
        >
          <span>YouTube Playlist</span>
          <ExternalLink size={12} />
        </a>
      </div>

      {/* Currently Active Background Spotlight Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-950/40 via-black/60 to-purple-950/30 border border-sky-400/40 p-3.5 sm:p-4 shadow-[0_8px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(56,189,248,0.15)]">
        {/* Subtle Cyber Corner Accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-pink-400 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-purple-400 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-sky-400 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Active Preview Thumbnail */}
          <div className="relative w-full sm:w-48 h-28 sm:h-32 rounded-xl overflow-hidden shrink-0 border border-sky-400/50 shadow-[0_0_15px_rgba(56,189,248,0.3)] group">
            <img
              src={currentVideo.thumbnail}
              alt={currentVideo.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-white/20 text-[10px] font-mono text-cyan-300 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
              <span>ACTIVE NOW</span>
            </div>
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-mono text-white">
              <span className="font-bold text-sky-300">#{String(currentBgIndex + 1).padStart(2, '0')}</span>
              <span className="text-[10px] text-stone-300">{currentVideo.theme}</span>
            </div>
          </div>

          {/* Active Info & Controls */}
          <div className="flex flex-col justify-between flex-1 min-w-0 w-full">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-400/40 text-[11px] font-mono font-bold">
                  BACKGROUND {String(currentBgIndex + 1).padStart(2, '0')}
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  Scene {currentBgIndex + 1} of {BACKGROUND_VIDEOS.length}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white mt-1.5 truncate">
                {currentVideo.title}
              </h3>
              <p className="text-xs text-stone-300 font-mono mt-0.5">
                Theme: <span className="text-cyan-300">{currentVideo.theme}</span>
              </p>
            </div>

            {/* Quick Navigation Controls: PREVIOUS & NEXT with Loop */}
            <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-white/10">
              <button
                onClick={(e) => prevBg(e)}
                className="cursor-pointer flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-white/5 hover:bg-sky-500/20 text-stone-200 hover:text-white border border-white/10 hover:border-sky-400/50 flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                title="Previous Background (Loops 1 → 10)"
              >
                <ChevronLeft size={16} />
                <span>◀ PREVIOUS</span>
              </button>

              <button
                onClick={(e) => nextBg(e)}
                className="cursor-pointer flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 text-sky-200 hover:text-white border border-sky-400/50 hover:border-sky-400/80 flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all active:scale-95 shadow-[0_0_15px_rgba(56,189,248,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                title="Next Background (Loops 10 → 1)"
              >
                <span>NEXT ▶</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of 10 Curated Backgrounds */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs font-mono text-stone-400 px-1">
          <span>SELECT DIRECTLY (10 OPTIONS)</span>
          <span className="text-sky-400">Click card to switch scene</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {BACKGROUND_VIDEOS.map((video, idx) => {
            const isActive = currentBgIndex === idx;

            return (
              <motion.button
                key={video.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setBgIndex(idx)}
                className={`cursor-pointer group relative flex items-center gap-3 p-2.5 rounded-xl text-left transition-all duration-300 min-h-[44px] border select-none ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-950/70 via-black/80 to-purple-950/50 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.25)]'
                    : 'bg-black/40 hover:bg-white/5 border-white/10 hover:border-white/25 hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
                }`}
                title={`Switch to BACKGROUND ${String(idx + 1).padStart(2, '0')}: ${video.title}`}
              >
                {/* Thumbnail Preview */}
                <div className="relative w-24 h-15 rounded-lg overflow-hidden shrink-0 border border-white/10 group-hover:border-sky-400/50 transition-colors">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-colors" />

                  {/* Number Badge */}
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[9px] font-mono font-bold text-sky-300 border border-white/15">
                    #{String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Details */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono font-bold tracking-wider ${
                        isActive ? 'text-cyan-300' : 'text-stone-400 group-hover:text-stone-300'
                      }`}
                    >
                      BACKGROUND {String(idx + 1).padStart(2, '0')}
                    </span>
                    {isActive && (
                      <span className="flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-semibold text-white truncate group-hover:text-sky-200 transition-colors mt-0.5">
                    {video.title}
                  </span>

                  <span className="text-[10px] text-stone-400 truncate font-mono mt-0.5">
                    {video.theme}
                  </span>
                </div>

                {/* Action Icon */}
                <div className="shrink-0 pr-1">
                  {isActive ? (
                    <div className="w-7 h-7 rounded-lg bg-sky-400/20 border border-sky-400/50 flex items-center justify-center text-sky-300">
                      <Check size={14} />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-sky-400/20 border border-transparent group-hover:border-sky-400/40 flex items-center justify-center text-stone-400 group-hover:text-sky-300 transition-colors">
                      <Play size={12} className="ml-0.5" />
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

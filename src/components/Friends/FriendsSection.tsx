import React, { useState } from 'react';
import { FRIENDS_DATA } from '../../data/friendsData';
import { FriendCard } from './FriendCard';
import { Users, Shield, ArrowRight, Compass } from 'lucide-react';
import { motion } from 'motion/react';
import { playSfx } from '../../lib/soundManager';

interface FriendsSectionProps {
  onContinueToAbout?: () => void;
}

export const FriendsSection: React.FC<FriendsSectionProps> = ({ onContinueToAbout }) => {
  const [filter, setFilter] = useState<'all' | 'fitness' | 'lifestyle'>('all');

  const filteredFriends = FRIENDS_DATA.filter((f) => {
    if (filter === 'fitness') return f.category.includes('FITNESS');
    if (filter === 'lifestyle') return f.category.includes('LIFESTYLE');
    return true;
  });

  return (
    <section id="my-friends-area" className="relative w-full my-6 text-left overflow-hidden">
      {/* Background Anime Energy Web & Soft Saffron-Golden Lighting */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-3/4 h-36 bg-gradient-to-r from-sky-500/10 via-amber-500/10 to-pink-500/10 blur-3xl pointer-events-none -z-10" />

      {/* Subtle Minimal Mandala Geometry (Background Watermark) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] pointer-events-none -z-10 opacity-[0.06] select-none">
        <motion.svg
          animate={{ rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
          viewBox="0 0 200 200"
          className="w-full h-full text-amber-300"
        >
          <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="4 4" />
          <circle cx="100" cy="100" r="72" fill="none" stroke="currentColor" strokeWidth="0.75" />
          <circle cx="100" cy="100" r="54" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 3" />
          <circle cx="100" cy="100" r="36" fill="none" stroke="currentColor" strokeWidth="0.75" />
          <circle cx="100" cy="100" r="18" fill="none" stroke="currentColor" strokeWidth="0.75" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <g key={deg} transform={`rotate(${deg} 100 100)`}>
              <path d="M100 28 C94 48 94 62 100 72 C106 62 106 48 100 28 Z" fill="none" stroke="currentColor" strokeWidth="0.75" />
              <path d="M100 10 C92 24 92 34 100 45 C108 34 108 24 100 10 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="100" cy="28" r="1.5" fill="currentColor" />
            </g>
          ))}
        </motion.svg>
      </div>

      {/* Futuristic Anime Section Divider with Subtle Golden Accent */}
      <div className="relative flex items-center justify-center my-6">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-400/30 to-white/20" />
        <div className="px-4 py-1 rounded-full bg-black/60 border border-amber-400/30 backdrop-blur-md flex items-center gap-2 text-[11px] font-mono tracking-widest text-amber-200/90 shadow-[0_0_15px_rgba(245,158,11,0.18)]">
          <span className="text-amber-400 text-xs select-none">🕉️</span>
          <Users size={12} className="text-amber-300" />
          <span>FRIENDS PROTOCOL // 絆・仲間</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
        </div>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-amber-400/30 to-white/20" />
      </div>

      {/* Main Heading: 👥 MY FRIENDS 🕉️ (Anime × Cinematic 3D × Futuristic UI) */}
      <div className="relative mb-6 text-center">
        {/* Floating Subtle Traditional Golden/Cosmic Particles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.span
            animate={{ y: [-5, 5, -5], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-2 left-1/4 text-xs text-amber-400/70 font-mono"
          >
            ✦
          </motion.span>
          <motion.span
            animate={{ y: [4, -4, 4], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-1 right-1/4 text-xs text-orange-400/70 font-mono"
          >
            ✧
          </motion.span>
          <motion.span
            animate={{ y: [-3, 3, -3], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-8 left-1/3 text-[10px] text-amber-300/60 font-mono"
          >
            •
          </motion.span>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex flex-col items-center"
        >
          {/* Subtitle tag with cultural touch */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-[1px] w-6 bg-amber-400/50" />
            <span className="text-[11px] font-mono tracking-[0.25em] text-amber-300 uppercase font-bold flex items-center gap-1.5">
              <span className="text-xs">🕉️</span>
              <span>FRIENDS • FAMILY • MEMORIES</span>
            </span>
            <span className="h-[1px] w-6 bg-amber-400/50" />
          </div>

          {/* Heading Text with 3D Depth & Elegant Om Symbol */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight font-['Cinzel'] text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] flex items-center justify-center gap-2.5 sm:gap-3">
            <span className="inline-block transform hover:rotate-6 transition-transform text-2xl sm:text-3xl">
              👥
            </span>
            <span className="relative inline-block bg-gradient-to-r from-white via-stone-100 to-amber-100 bg-clip-text text-transparent">
              MY FRIENDS
            </span>
            <span
              className="inline-block text-lg sm:text-xl text-amber-400/90 font-serif drop-shadow-[0_0_12px_rgba(245,158,11,0.5)] select-none ml-0.5 hover:scale-110 transition-transform"
              title="Om"
            >
              🕉️
            </span>
          </h2>

          {/* Cinematic Underline Bar with Warm Golden/Saffron Accent */}
          <div className="w-28 h-1 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-pink-500 mt-2 shadow-[0_0_12px_rgba(245,158,11,0.4)]" />

          {/* Descriptive Quote */}
          <p className="text-xs sm:text-sm text-stone-300/90 max-w-xl mx-auto mt-3 leading-relaxed">
            Honoring the brotherly bond, fitness discipline, and memorable milestones shared with close companions. Connect directly with their journeys on Instagram.
          </p>
        </motion.div>
      </div>

      {/* Filter Category Tabs (Anime Pills) */}
      <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
        <button
          onClick={() => {
            playSfx('nav');
            setFilter('all');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all duration-300 border cursor-pointer ${
            filter === 'all'
              ? 'bg-sky-500/20 text-sky-200 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
              : 'bg-black/40 text-stone-400 border-white/10 hover:border-white/20 hover:text-stone-200'
          }`}
        >
          ALL FRIENDS (5)
        </button>

        <button
          onClick={() => {
            playSfx('nav');
            setFilter('fitness');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all duration-300 border cursor-pointer ${
            filter === 'fitness'
              ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'bg-black/40 text-stone-400 border-white/10 hover:border-white/20 hover:text-stone-200'
          }`}
        >
          🏋️ ATHLETE & FITNESS
        </button>

        <button
          onClick={() => {
            playSfx('nav');
            setFilter('lifestyle');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all duration-300 border cursor-pointer ${
            filter === 'lifestyle'
              ? 'bg-purple-500/20 text-purple-200 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
              : 'bg-black/40 text-stone-400 border-white/10 hover:border-white/20 hover:text-stone-200'
          }`}
        >
          ✨ LIFESTYLE & BIKES
        </button>
      </div>

      {/* Responsive Grid of 5 Friend Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {filteredFriends.map((friend, idx) => (
          <FriendCard key={friend.id} friend={friend} index={idx} />
        ))}
      </div>

      {/* Transition to ABOUT ME */}
      {onContinueToAbout && (
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-400 font-mono">
            <Compass size={14} className="text-sky-400" />
            <span>Next in Wolfey dossier: <strong>ABOUT ME</strong></span>
          </div>

          <motion.button
            onClick={() => {
              playSfx('about');
              onContinueToAbout();
            }}
            whileHover={{ scale: 1.03, x: 2 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold text-sky-200 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/40 shadow-md transition-all cursor-pointer"
          >
            <span>PROCEED TO ABOUT ME</span>
            <ArrowRight size={13} className="text-sky-300" />
          </motion.button>
        </div>
      )}
    </section>
  );
};

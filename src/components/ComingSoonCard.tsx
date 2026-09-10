import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Clock, Wrench, X, Layers, Flame } from 'lucide-react';
import { playSfx } from '../lib/soundManager';
import { registerRealClick } from '../lib/firebase';

interface ComingSoonCardProps {
  id: string;
  title: string;
  category: string;
  discipline: string;
  conceptPreview: string;
  targetQuarter?: string;
  productionPhase?: string;
  toolsUsed: string[];
  accentColor?: string;
}

export const ComingSoonCard: React.FC<ComingSoonCardProps> = ({
  id,
  title,
  category,
  discipline,
  conceptPreview,
  targetQuarter = '2026 RELEASE',
  productionPhase = 'In Active Production',
  toolsUsed,
  accentColor = '#38bdf8',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleCardClick = () => {
    playSfx('projects');
    setIsOpen(true);
    registerRealClick(`coming_soon_${id}`);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      typeof window !== 'undefined' &&
      (window.innerWidth < 768 || ('ontouchstart' in window && window.innerWidth < 1024))
    ) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: -(y / (rect.height / 2)) * 0.8,
      y: (x / (rect.width / 2)) * 0.8,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="group relative p-4 rounded-2xl bg-gradient-to-br from-[#0c0d1e]/90 via-[#090a16]/80 to-[#12132a]/90 border border-sky-400/30 hover:border-pink-400/50 backdrop-blur-xl cursor-pointer transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_0_25px_rgba(56,189,248,0.25)] flex flex-col sm:flex-row gap-4 items-start sm:items-center overflow-hidden select-none"
      >
        {/* Futuristic Cyber Corner Brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-pink-400 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-sky-400 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-purple-400 pointer-events-none" />

        {/* Scanning Laser Beam Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25 group-hover:opacity-45 transition-opacity">
          <motion.div
            animate={{ y: ['-100%', '300%'] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
            className="w-full h-12 bg-gradient-to-b from-transparent via-cyan-400 to-transparent blur-[3px]"
          />
        </div>

        {/* 9:16 Portrait Holographic Poster Slot */}
        <div
          className="relative w-full sm:w-[110px] h-[160px] sm:h-[140px] rounded-xl overflow-hidden flex-shrink-0 bg-stone-950/90 border border-sky-400/40 flex flex-col items-center justify-center p-2 text-center"
          style={{ aspectRatio: '9 / 16' }}
        >
          {/* Holographic Circuit Lines Grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(rgba(56, 189, 248, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.4) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />

          {/* Floating Neon Lock / Sparkle Orb */}
          <motion.div
            animate={{ y: [-3, 3, -3], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10 w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-300/50 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.5)] mb-2"
          >
            <Lock size={22} className="text-sky-300 group-hover:text-pink-300 transition-colors" />
          </motion.div>

          {/* Glowing Pill Ribbon */}
          <div className="relative z-10 px-2 py-0.5 rounded-full bg-pink-500/25 border border-pink-400/60 text-[9px] font-mono font-black text-pink-200 tracking-wider shadow-[0_0_12px_rgba(244,114,182,0.4)] animate-pulse">
            COMING SOON
          </div>

          <span className="relative z-10 text-[8px] font-mono text-stone-400 mt-1 uppercase tracking-widest">
            {targetQuarter}
          </span>
        </div>

        {/* Information & Concept Details */}
        <div className="flex-1 min-w-0 z-10">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-400/40 text-[10px] font-mono font-bold text-sky-300">
              {category}
            </span>
            <span className="px-2 py-0.5 rounded bg-pink-500/15 border border-pink-400/30 text-[10px] font-mono text-pink-300 flex items-center gap-1">
              <Flame size={11} className="text-pink-400" />
              {productionPhase}
            </span>
            <span className="text-[11px] font-mono text-stone-400 ml-auto flex items-center gap-1">
              <Clock size={11} className="text-sky-400" />
              {targetQuarter}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-extrabold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-sky-300 group-hover:to-pink-300 transition-all font-['Plus_Jakarta_Sans'] flex items-center gap-2">
            {title}
            <Flame size={13} className="text-amber-400" />
          </h3>

          <p className="text-xs text-stone-300 mt-1 leading-relaxed line-clamp-2">
            {conceptPreview}
          </p>

          {/* Tools In Production */}
          <div className="flex items-center gap-1.5 flex-wrap mt-2.5 pt-2 border-t border-white/10">
            <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1">
              <Wrench size={10} className="text-sky-400" /> Tools:
            </span>
            {toolsUsed.map((tool) => (
              <span
                key={tool}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-stone-200 border border-white/10 group-hover:border-sky-400/30 transition-colors"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Cyber Coming Soon Holographic Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer select-none"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-2xl bg-[#0d0e22] border border-sky-400/40 p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(56,189,248,0.25)] flex flex-col gap-4 text-left cursor-default overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  playSfx('hide');
                  setIsOpen(false);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Status Header */}
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 border border-pink-400/50 text-xs font-mono font-bold text-pink-300 flex items-center gap-1.5">
                  <Flame size={12} className="text-pink-400" />
                  UPCOMING PRODUCTION • NOT YET PUBLISHED
                </span>
              </div>

              {/* Title & Tagline */}
              <div>
                <h3 className="text-xl font-black text-white font-['Plus_Jakarta_Sans']">
                  {title}
                </h3>
                <p className="text-xs font-mono text-sky-300 mt-0.5">
                  Category: {category} // Discipline: {discipline}
                </p>
              </div>

              {/* Honest Notice */}
              <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-400/30 text-xs text-stone-200 leading-relaxed">
                <strong className="text-sky-300 block mb-1 font-mono uppercase tracking-wider">
                  ✦ Creative Production In Progress
                </strong>
                Wolfey is currently actively designing and developing this project. To keep the portfolio transparent and honest, this slot represents an upcoming piece rather than an existing live artifact.
              </div>

              {/* Concept Synopsis */}
              <div>
                <h4 className="text-xs font-mono font-bold text-stone-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Layers size={13} className="text-cyan-400" /> Project Concept & Vision
                </h4>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/10">
                  {conceptPreview}
                </p>
              </div>

              {/* Production Pipeline & Software */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-mono text-stone-400">
                  Target Release: <strong className="text-white">{targetQuarter}</strong> • Stage:{' '}
                  <strong className="text-pink-300">{productionPhase}</strong>
                </span>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-mono text-stone-400">Software in Use:</span>
                  {toolsUsed.map((tool) => (
                    <span
                      key={tool}
                      className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-xs font-mono text-sky-200"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

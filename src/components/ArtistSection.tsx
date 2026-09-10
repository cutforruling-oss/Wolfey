import React, { useState } from 'react';
import { Palette, Eye, CheckCircle2, X, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { registerRealClick } from '../lib/firebase';
import { playSfx } from '../lib/soundManager';

interface ArtistArtwork {
  id: string;
  title: string;
  mediaUrl: string;
  description: string;
  dimensions: string;
  category: string;
  tags: string[];
}

export const ArtistSection: React.FC = () => {
  // Wolfey's original featured digital illustrations in 9:16 vertical portrait format
  const originalArtworks: ArtistArtwork[] = [
    {
      id: 'artist-art-1',
      title: 'Guuji Yae Shrine Reverie',
      mediaUrl: '/assets/gallery/gallery_1_fdd1c18f.png',
      description: 'Wolfey original key visual blending sacred sakura blossom petals with electro luminescence and atmospheric depth.',
      dimensions: '1080 × 1920 (9:16)',
      category: 'Anime Art',
      tags: ['Sakura', 'Electro', 'Key Art', '9:16 Portrait'],
    },
    {
      id: 'artist-art-2',
      title: 'Neon Ronin Character Illustration',
      mediaUrl: '/assets/gallery/gallery_8_0cc5a144.png',
      description: 'Stylized original character concept depicting a futuristic katana wielder immersed in a dystopian neon metropolis.',
      dimensions: '1080 × 1920 (9:16)',
      category: 'Anime Art',
      tags: ['Anime Art', 'Concept Design', 'Digital Painting', '9:16 Portrait'],
    },
  ];

  const [activeModalArtwork, setActiveModalArtwork] = useState<ArtistArtwork | null>(null);

  const handleOpenLightbox = (artwork: ArtistArtwork) => {
    playSfx('image-open');
    setActiveModalArtwork(artwork);
    registerRealClick(`artist_lightbox_${artwork.id}`);
  };

  const handleCloseLightbox = () => {
    playSfx('hide');
    setActiveModalArtwork(null);
  };

  return (
    <div id="artist-gallery-section" className="flex flex-col gap-4 text-left py-2">
      {/* Header Banner */}
      <div className="relative p-4 sm:p-5 rounded-2xl bg-black/55 border border-pink-500/35 backdrop-blur-xl shadow-[0_0_30px_rgba(236,72,153,0.18)] overflow-hidden">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-pink-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-pink-300 uppercase tracking-wider">
            <Palette size={16} className="text-pink-400 animate-pulse" />
            <span>Artist Portfolio • Original Artworks</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-200 border border-pink-500/30 shadow-[0_0_10px_rgba(236,72,153,0.25)]">
              {originalArtworks.length} Masterworks
            </span>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-500/30">
              9:16 Portrait
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
          Wolfey's featured digital artwork illustrations presented in authentic 9:16 vertical portrait format with cinematic color grading, lighting dynamics, and responsive anime lightbox view.
        </p>
      </div>

      {/* Grid of Artworks with 9:16 Portrait Presentation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {originalArtworks.map((art) => {
          return (
            <motion.div
              key={art.id}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="group relative rounded-2xl overflow-hidden bg-black/50 border border-pink-500/35 hover:border-pink-400/80 backdrop-blur-md transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,0.6),0_0_20px_rgba(236,72,153,0.15)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.7),0_0_30px_rgba(236,72,153,0.4)] flex flex-col cursor-pointer"
              onClick={() => handleOpenLightbox(art)}
            >
              {/* Light sweep shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none z-20" />

              {/* STRICT 9:16 PORTRAIT CONTAINER */}
              <div
                className="relative w-full overflow-hidden bg-stone-950 flex items-center justify-center"
                style={{
                  aspectRatio: '9 / 16',
                  width: '100%',
                }}
              >
                <img
                  src={art.mediaUrl}
                  alt={art.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 select-none"
                  style={{
                    aspectRatio: '9 / 16',
                    objectFit: 'cover',
                  }}
                />

                {/* Subtle dark vignette gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Cyber Corner Brackets */}
                <span className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-pink-400/80 pointer-events-none" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-pink-400/80 pointer-events-none" />
                <span className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-pink-400/80 pointer-events-none" />
                <span className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-pink-400/80 pointer-events-none" />

                {/* Zoom In Icon Hover Reveal */}
                <div className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 border border-white/20 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  <ZoomIn size={14} className="text-pink-300" />
                </div>

                {/* Overlay Text Details on artwork */}
                <div className="absolute bottom-0 inset-x-0 p-4 z-10 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/30 text-pink-200 border border-pink-400/40">
                      {art.category}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/60 text-stone-300 border border-white/10">
                      {art.dimensions}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-pink-200 transition-colors drop-shadow">
                    {art.title}
                  </h3>

                  <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                    {art.description}
                  </p>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="p-3 bg-black/60 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-stone-300 font-mono">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span>Original Illustration</span>
                </div>

                <div className="flex items-center gap-1 text-xs font-mono text-pink-400 group-hover:text-pink-300">
                  <Eye size={13} />
                  <span>View 9:16 Art</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {activeModalArtwork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl"
            onClick={handleCloseLightbox}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full max-h-[92vh] flex flex-col rounded-2xl bg-[#121218] border border-pink-500/50 shadow-[0_0_50px_rgba(236,72,153,0.3)] overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={handleCloseLightbox}
                className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/70 text-stone-300 hover:text-white border border-white/20 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Lightbox 9:16 Image Display */}
              <div className="relative w-full max-h-[65vh] flex items-center justify-center bg-black/80 p-2 overflow-hidden">
                <img
                  src={activeModalArtwork.mediaUrl}
                  alt={activeModalArtwork.title}
                  className="max-h-[62vh] w-auto object-contain rounded-lg select-none shadow-2xl"
                  style={{ aspectRatio: '9 / 16' }}
                />
              </div>

              {/* Lightbox Information Bar */}
              <div className="p-4 sm:p-5 flex flex-col gap-2 bg-black/60 border-t border-white/10 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-200 border border-pink-500/30">
                    {activeModalArtwork.category}
                  </span>
                  <span className="text-[11px] font-mono text-stone-400">
                    {activeModalArtwork.dimensions}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white">
                  {activeModalArtwork.title}
                </h3>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  {activeModalArtwork.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-1 pt-2 border-t border-white/10">
                  {activeModalArtwork.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-stone-400 border border-white/10"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

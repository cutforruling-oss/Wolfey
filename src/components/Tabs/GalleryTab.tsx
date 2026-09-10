import React, { useState, useEffect } from 'react';
import { GalleryPost } from '../../types';
import { X, ChevronLeft, ChevronRight, Eye, Tag, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { registerRealClick } from '../../lib/firebase';
import { playSfx } from '../../lib/soundManager';

interface GalleryTabProps {
  posts: GalleryPost[];
}

type GalleryFilterCategory =
  | 'All'
  | 'Anime Art'
  | 'Character Designs'
  | 'Game Design'
  | 'Graphic Design'
  | '3D Work'
  | 'Video Edits'
  | 'Animation';

export const GalleryTab: React.FC<GalleryTabProps> = ({ posts }) => {
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<GalleryFilterCategory>('All');

  const categories: GalleryFilterCategory[] = [
    'All',
    'Anime Art',
    'Character Designs',
    'Game Design',
    'Graphic Design',
    '3D Work',
    'Video Edits',
    'Animation',
  ];

  const filteredPosts = posts.filter((post) => {
    if (activeCategory === 'All') return true;
    return post.category === activeCategory;
  });

  const selectedPost = selectedPostIndex !== null ? posts[selectedPostIndex] : null;

  const handleOpenLightbox = (index: number) => {
    playSfx('image-open');
    setSelectedPostIndex(index);
    registerRealClick(`gallery_view_${posts[index].id}`);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPostIndex === null) return;
    playSfx('nav');
    const nextIdx = (selectedPostIndex - 1 + posts.length) % posts.length;
    setSelectedPostIndex(nextIdx);
    registerRealClick('gallery_prev');
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPostIndex === null) return;
    playSfx('nav');
    const nextIdx = (selectedPostIndex + 1) % posts.length;
    setSelectedPostIndex(nextIdx);
    registerRealClick('gallery_next');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPostIndex === null) return;
      if (e.key === 'Escape') setSelectedPostIndex(null);
      if (e.key === 'ArrowLeft') setSelectedPostIndex((selectedPostIndex - 1 + posts.length) % posts.length);
      if (e.key === 'ArrowRight') setSelectedPostIndex((selectedPostIndex + 1) % posts.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPostIndex, posts.length]);

  return (
    <div id="gallery-tab-content" className="flex flex-col gap-4 py-2 text-left">
      {/* 9:16 Aspect Ratio Banner Header */}
      <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-300 uppercase tracking-wider">
          <Eye size={14} />
          <span>Vertical Visual Showcase</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-500/30">
            {posts.length} Visual Works
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-200 border border-sky-400/30">
            9:16 Portrait
          </span>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                playSfx('gallery');
                setActiveCategory(cat);
                registerRealClick(`gal_cat_${cat}`);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                isActive
                  ? 'bg-sky-400/20 text-sky-200 border border-sky-400/40 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                  : 'bg-white/5 text-stone-300 hover:text-white border border-transparent'
              }`}
            >
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Grid of gallery cards strictly in 9:16 Portrait Format */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filteredPosts.map((post) => {
          const originalIndex = posts.findIndex((p) => p.id === post.id);

          return (
            <motion.div
              key={post.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleOpenLightbox(originalIndex)}
              className="group relative rounded-xl overflow-hidden backdrop-blur-md cursor-pointer transition-all duration-300 flex flex-col bg-black/40 border border-white/10 hover:border-sky-300/40 hover:shadow-[0_0_20px_rgba(162,230,255,0.2)]"
            >
              {/* STRICT 9:16 PORTRAIT CONTAINER */}
              <div
                className="relative w-full overflow-hidden bg-stone-950 flex items-center justify-center"
                style={{
                  aspectRatio: '9 / 16',
                  width: '100%',
                }}
              >
                <img
                  src={post.mediaUrl}
                  alt={post.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{
                    aspectRatio: '9 / 16',
                    objectFit: 'cover',
                  }}
                />

                {/* Hover overlay with 9:16 pill badge */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-2.5">
                  <div className="flex justify-end">
                    <span className="p-1.5 rounded-lg bg-black/60 text-white backdrop-blur-md">
                      <Maximize2 size={12} />
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/30 text-sky-200 border border-sky-400/40 mb-1 inline-block">
                      {post.category}
                    </span>
                    <h4 className="text-xs font-bold text-white leading-tight line-clamp-2">
                      {post.title}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Bottom Card Meta Label */}
              <div className="p-2 bg-black/60 border-t border-white/5">
                <div className="text-[11px] font-semibold text-stone-200 truncate">
                  {post.title}
                </div>
                <div className="text-[10px] text-stone-400 flex items-center justify-between mt-0.5 font-mono">
                  <span className={post.category === 'Artist' ? 'text-pink-300' : ''}>
                    {post.category}
                  </span>
                  <span className="text-sky-300">9:16</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Modal with 9:16 vertical view */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPostIndex(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-sm sm:max-w-md w-full flex flex-col items-center max-h-[96vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPostIndex(null)}
                className="absolute -top-10 right-0 cursor-pointer text-stone-300 hover:text-white p-1 rounded-full bg-white/10"
              >
                <X size={20} />
              </button>

              {/* 9:16 Image Container */}
              <div
                className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black flex items-center justify-center max-h-[78vh] w-full"
                style={{
                  aspectRatio: '9 / 16',
                  maxWidth: '380px',
                }}
              >
                <img
                  src={selectedPost.mediaUrl}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                  style={{
                    aspectRatio: '9 / 16',
                    objectFit: 'cover',
                  }}
                />

                {/* Left/Right controls */}
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 cursor-pointer transition-colors border border-white/20"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 cursor-pointer transition-colors border border-white/20"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Details Pane */}
              <div className="w-full max-w-[380px] mt-2.5 p-3 rounded-xl bg-black/75 border border-white/10 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white truncate">
                    {selectedPost.title}
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      selectedPost.category === 'Artist'
                        ? 'bg-pink-500/20 text-pink-300 border-pink-400/30'
                        : 'bg-sky-400/20 text-sky-300 border-sky-400/30'
                    }`}
                  >
                    {selectedPost.category}
                  </span>
                </div>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                  {selectedPost.description}
                </p>
                {selectedPost.tags && (
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {selectedPost.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-stone-300"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

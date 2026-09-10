import React, { useRef, useState } from 'react';
import { FriendProfile } from '../../types';
import { motion } from 'motion/react';
import {
  Instagram,
  ExternalLink,
  Star,
  Dumbbell,
  Compass,
  Bike,
  Heart,
  Calendar,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { playSfx } from '../../lib/soundManager';
import { registerRealClick } from '../../lib/firebase';

interface FriendCardProps {
  friend: FriendProfile;
  index: number;
}

export const FriendCard: React.FC<FriendCardProps> = ({ friend, index }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  // 3D Parallax Tilt Handler (Subtle max ~0.9deg, disabled on touch/mobile)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    if (
      typeof window !== 'undefined' &&
      (window.innerWidth < 768 || ('ontouchstart' in window && window.innerWidth < 1024))
    ) {
      return;
    }
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Reduced by ~88% to a subtle, calm 0.9°
    const rotX = -((y - centerY) / centerY) * 0.9;
    const rotY = ((x - centerX) / centerX) * 0.9;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.15,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    playSfx('nav');
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleInstagramClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSfx('click-enter');
    registerRealClick(`friend_instagram_${friend.id}`);
  };

  // Select Avatar Emblem Icon based on persona
  const renderPersonaAvatarEmblem = () => {
    switch (friend.avatarIconType) {
      case 'fitness':
        return (
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-950/70 via-slate-900 to-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.25)_0%,transparent_70%)] animate-pulse" />
            <div className="relative flex flex-col items-center justify-center">
              <Dumbbell size={36} className="text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] font-mono font-black tracking-widest text-emerald-300 uppercase">
                  ATHLETE
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-400/40">
                  20 YRS
                </span>
              </div>
            </div>
          </div>
        );
      case 'bike':
        return (
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-950/70 via-stone-900 to-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.25)_0%,transparent_70%)] animate-pulse" />
            <div className="relative flex flex-col items-center justify-center">
              <Bike size={38} className="text-orange-400 drop-shadow-[0_0_12px_rgba(249,115,22,0.8)]" />
              <span className="text-[10px] font-mono font-black tracking-widest text-orange-300 uppercase mt-1">
                ROYAL RIDER
              </span>
            </div>
          </div>
        );
      case 'personal':
        return (
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-950/70 via-slate-900 to-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.25)_0%,transparent_70%)] animate-pulse" />
            <div className="relative flex flex-col items-center justify-center">
              <Star size={36} className="text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
              <span className="text-[10px] font-mono font-black tracking-widest text-purple-300 uppercase mt-1">
                LIFESTYLE
              </span>
            </div>
          </div>
        );
      case 'travel_gym':
        return (
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-950/70 via-slate-900 to-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.25)_0%,transparent_70%)] animate-pulse" />
            <div className="relative flex flex-col items-center justify-center">
              <Compass size={36} className="text-sky-400 drop-shadow-[0_0_12px_rgba(14,165,233,0.8)]" />
              <span className="text-[10px] font-mono font-black tracking-widest text-sky-300 uppercase mt-1">
                EXPLORER
              </span>
            </div>
          </div>
        );
      case 'family':
      default:
        return (
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-950/70 via-slate-900 to-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.25)_0%,transparent_70%)] animate-pulse" />
            <div className="relative flex flex-col items-center justify-center">
              <Heart size={36} className="text-emerald-400 drop-shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
              <span className="text-[10px] font-mono font-black tracking-widest text-emerald-300 uppercase mt-1">
                FAMILY & LIFE
              </span>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className="group relative rounded-2xl p-[1.5px] transition-all duration-300 ease-out select-none flex flex-col"
    >
      {/* Dynamic Animated Anime 3D Border Glow */}
      <div
        className="absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none"
        style={{
          background: isHovered
            ? `radial-gradient(circle at ${glare.x}% ${glare.y}%, ${friend.accentColor}, ${friend.secondaryColor}, transparent 75%)`
            : `linear-gradient(135deg, ${friend.accentColor}40, transparent 40%, ${friend.secondaryColor}30)`,
          opacity: isHovered ? 1 : 0.6,
          boxShadow: isHovered ? `0 0 30px ${friend.auraGlow}` : 'none',
        }}
      />

      {/* Cyber Corner Brackets */}
      <span
        className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 pointer-events-none z-30 transition-colors duration-300"
        style={{ borderColor: friend.accentColor }}
      />
      <span
        className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 pointer-events-none z-30 transition-colors duration-300"
        style={{ borderColor: friend.secondaryColor }}
      />
      <span
        className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 pointer-events-none z-30 transition-colors duration-300"
        style={{ borderColor: friend.secondaryColor }}
      />
      <span
        className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 pointer-events-none z-30 transition-colors duration-300"
        style={{ borderColor: friend.accentColor }}
      />

      {/* Card Body Container */}
      <div
        className="relative w-full h-full rounded-[15px] bg-[#12121c]/90 backdrop-blur-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden z-20 border border-white/10"
        style={{
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Animated Light Sweep Shimmer across card on hover */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none z-30" />

        {/* Specular Radial Glare Overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[15px] z-20 transition-opacity duration-200"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.2) 0%, transparent 60%)`,
            opacity: glare.opacity,
          }}
        />

        {/* Card Header: Category Badge & Ally Index */}
        <div className="relative z-10 flex items-center justify-between gap-2 mb-3.5">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider border shadow-sm"
            style={{
              backgroundColor: `${friend.accentColor}18`,
              color: '#ffffff',
              borderColor: `${friend.accentColor}50`,
              boxShadow: `0 0 10px ${friend.accentColor}25`,
            }}
          >
            <span>{friend.category}</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[10px] text-stone-400 bg-black/40 px-2 py-0.5 rounded-md border border-white/5">
            <span className="text-amber-400/85 text-[10px] select-none" title="Brotherly Bond">
              🕉️
            </span>
            <span className="text-sky-300 font-bold">0{index + 1}</span>
            <span>/</span>
            <span>05</span>
          </div>
        </div>

        {/* Center: 3D Anime Profile Frame & Avatar */}
        <div className="relative z-10 flex items-center gap-3.5 sm:gap-4 my-1">
          {/* Avatar Ring Frame with Rotating Accent */}
          <div className="relative w-20 h-20 sm:w-22 sm:h-22 shrink-0 flex items-center justify-center">
            {/* Outer Pulsing Aura */}
            <div
              className="absolute inset-0 rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition-opacity duration-300 pointer-events-none"
              style={{ backgroundColor: friend.accentColor }}
            />

            {/* Futuristic Double Layer Frame */}
            <div
              className="relative w-full h-full rounded-2xl overflow-hidden border-2 transition-transform duration-500 group-hover:scale-105 shadow-xl"
              style={{
                borderColor: friend.accentColor,
                boxShadow: `0 0 18px ${friend.auraGlow}`,
              }}
            >
              {friend.avatarUrl ? (
                <img
                  src={friend.avatarUrl}
                  alt={friend.name}
                  className="w-full h-full object-cover select-none transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                renderPersonaAvatarEmblem()
              )}
            </div>

            {/* Corner Energy Pin */}
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-black font-bold shadow-md border border-white/40"
              style={{ backgroundColor: friend.secondaryColor }}
            >
              {friend.symbol}
            </div>
          </div>

          {/* Name & Handle Information */}
          <div className="flex flex-col justify-center min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-white tracking-wide font-['Plus_Jakarta_Sans'] truncate group-hover:text-sky-200 transition-colors drop-shadow">
                {friend.name}
              </h3>
              {friend.age && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-stone-200 border border-white/15">
                  {friend.age} Y/O
                </span>
              )}
            </div>

            {/* Instagram Handle with Gradient Shimmer */}
            <a
              href={friend.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleInstagramClick}
              className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-pink-400 hover:text-pink-300 mt-0.5 transition-colors group/insta"
            >
              <Instagram size={12} className="shrink-0 text-pink-400 group-hover/insta:animate-bounce" />
              <span className="truncate">{friend.instagramHandle}</span>
            </a>

            {/* Verified Friend Badge */}
            <div className="flex items-center gap-1 mt-1.5 text-[10px] text-stone-300 font-mono">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>Verified Friend & Ally</span>
            </div>
          </div>
        </div>

        {/* Bio Description */}
        <p className="relative z-10 text-xs sm:text-[13px] text-stone-200/95 leading-relaxed my-3 font-normal">
          {friend.description}
        </p>

        {/* Highlights Bullets */}
        <div className="relative z-10 flex flex-col gap-1 my-1.5 pt-2 border-t border-white/10">
          {friend.bulletPoints.map((point, ptIdx) => (
            <div key={ptIdx} className="flex items-center gap-1.5 text-[11px] text-stone-300 font-mono">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: friend.accentColor }} />
              <span className="truncate">{point}</span>
            </div>
          ))}
        </div>

        {/* Bottom Action: VIEW INSTAGRAM Button with Anime 3D Press */}
        <div className="relative z-10 pt-3.5 mt-1 border-t border-white/10">
          <motion.a
            href={friend.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleInstagramClick}
            whileHover={{ scale: 1.025, y: -2 }}
            whileTap={{ scale: 0.94, y: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="group/btn relative w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black font-mono tracking-wider transition-all duration-300 overflow-hidden cursor-pointer border shadow-lg"
            style={{
              background: `linear-gradient(135deg, rgba(236,72,153,0.3) 0%, rgba(99,102,241,0.3) 100%)`,
              borderColor: 'rgba(244,114,182,0.5)',
              boxShadow: `0 4px 18px rgba(236,72,153,0.25), inset 0 1px 1px rgba(255,255,255,0.3)`,
            }}
          >
            {/* Button light sweep */}
            <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

            <Instagram size={15} className="text-pink-300 group-hover/btn:scale-110 transition-transform" />
            <span className="text-white drop-shadow">VIEW INSTAGRAM</span>
            <ExternalLink size={13} className="text-pink-200 opacity-75 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all" />
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
};

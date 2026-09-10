import React, { useState } from 'react';
import { AtmosphereOption } from '../../types';
import { Layers, Flower2, Zap, Radio, CircleOff, ChevronDown, Eye, Gauge } from 'lucide-react';
import { playSfx } from '../../lib/soundManager';
import { registerRealClick } from '../../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { usePerformance } from '../../context/PerformanceContext';
import { PerformanceTier } from '../../lib/performanceManager';

interface AtmosphereSelectorProps {
  currentAtmosphere: AtmosphereOption;
  onChangeAtmosphere: (option: AtmosphereOption) => void;
  isEntered: boolean;
}

interface OptionConfig {
  id: AtmosphereOption;
  label: string;
  subLabel: string;
  emoji: string;
  icon: React.ReactNode;
  activeColor: string;
  glowColor: string;
  borderColor: string;
  bgGradient: string;
  badgeText: string;
}

const ATMOSPHERE_OPTIONS: OptionConfig[] = [
  {
    id: 'sakura',
    label: 'Sakura',
    subLabel: '桜吹雪',
    emoji: '🌸',
    icon: <Flower2 size={13} className="text-pink-400" />,
    activeColor: 'text-pink-200',
    glowColor: 'rgba(244, 114, 182, 0.45)',
    borderColor: 'border-pink-400/60',
    bgGradient: 'from-pink-500/25 via-rose-500/15 to-transparent',
    badgeText: 'BLOOM',
  },
  {
    id: 'cyber',
    label: 'Cyber',
    subLabel: '電脳火花',
    emoji: '⚡',
    icon: <Zap size={13} className="text-cyan-300" />,
    activeColor: 'text-cyan-200',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    borderColor: 'border-cyan-400/60',
    bgGradient: 'from-cyan-500/25 via-sky-500/15 to-transparent',
    badgeText: 'ENERGY',
  },
  {
    id: 'spirit',
    label: 'Spirit',
    subLabel: '霊魂光',
    emoji: '🔮',
    icon: <Radio size={13} className="text-purple-300" />,
    activeColor: 'text-purple-200',
    glowColor: 'rgba(192, 132, 252, 0.45)',
    borderColor: 'border-purple-400/60',
    bgGradient: 'from-purple-500/25 via-indigo-500/15 to-transparent',
    badgeText: 'ETHEREAL',
  },
  {
    id: 'off',
    label: 'OFF',
    subLabel: '解除',
    emoji: '○',
    icon: <CircleOff size={13} className="text-stone-400" />,
    activeColor: 'text-stone-200',
    glowColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'border-stone-500/40',
    bgGradient: 'from-white/10 to-transparent',
    badgeText: 'NONE',
  },
];

export const AtmosphereSelector: React.FC<AtmosphereSelectorProps> = ({
  currentAtmosphere,
  onChangeAtmosphere,
  isEntered,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  const { tier, setTier } = usePerformance();

  // STRICT RULE: Front page has NO visible controls; only appears on Main Page!
  if (!isEntered) return null;

  const currentConfig =
    ATMOSPHERE_OPTIONS.find((opt) => opt.id === currentAtmosphere) ||
    ATMOSPHERE_OPTIONS[0];

  const handleSelect = (optId: AtmosphereOption) => {
    if (optId === currentAtmosphere) return;

    if (optId === 'sakura') playSfx('atmosphere-sakura');
    else if (optId === 'cyber') playSfx('atmosphere-cyber');
    else if (optId === 'spirit') playSfx('atmosphere-spirit');
    else playSfx('atmosphere-off');

    onChangeAtmosphere(optId);
    registerRealClick(`atmosphere_select_${optId}`);
  };

  const handleTierChange = (newTier: PerformanceTier) => {
    setTier(newTier);
    playSfx('nav');
  };

  const tierColors: Record<PerformanceTier, { text: string; bg: string; border: string }> = {
    high: { text: 'text-emerald-300', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' },
    balanced: { text: 'text-sky-300', bg: 'bg-sky-500/20', border: 'border-sky-500/40' },
    performance: { text: 'text-amber-300', bg: 'bg-amber-500/20', border: 'border-amber-500/40' },
  };

  return (
    <div
      id="wolfey-atmosphere-controller"
      className="fixed top-4 right-4 z-40 pointer-events-auto flex flex-col items-end select-none font-mono"
    >
      <AnimatePresence mode="wait">
        {!isCollapsed ? (
          /* ==========================================================
             EXPANDED 3D ANIME ATMOSPHERE DOCK
             ========================================================== */
          <motion.div
            key="atmosphere-dock-expanded"
            initial={{ opacity: 0, y: -12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.94 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-1.5 p-2 sm:p-2.5 rounded-2xl bg-[#0b0c1b]/92 border border-sky-400/35 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.75),0_0_25px_rgba(56,189,248,0.2)] max-w-[92vw] sm:max-w-none"
            style={{
              perspective: '1000px',
            }}
          >
            {/* Cyber Corner Visual Accents */}
            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-pink-400 pointer-events-none" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
            <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-purple-400 pointer-events-none" />
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-sky-400 pointer-events-none" />

            {/* Header: Title + Collapse Button */}
            <div className="flex items-center justify-between gap-3 px-1 border-b border-white/10 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Layers size={13} className="text-pink-300" />
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                  ATMOSPHERE
                </span>
                <span className="text-[9px] text-sky-300/80 font-normal">
                  // 環境効果
                </span>
              </div>

              <button
                onClick={() => {
                  playSfx('hide');
                  setIsCollapsed(true);
                }}
                className="cursor-pointer p-1 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-all"
                title="Minimize Atmosphere Controls"
                aria-label="Minimize"
              >
                <ChevronDown size={13} />
              </button>
            </div>

            {/* 4 Interactive Atmosphere Options */}
            <div className="grid grid-cols-4 gap-1 sm:gap-1.5 pt-0.5">
              {ATMOSPHERE_OPTIONS.map((opt) => {
                const isActive = currentAtmosphere === opt.id;

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    className={`cursor-pointer group relative flex flex-col items-center justify-center px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl transition-all duration-200 active:scale-95 border select-none ${
                      isActive
                        ? `bg-gradient-to-b ${opt.bgGradient} ${opt.borderColor} shadow-[0_0_15px_${opt.glowColor}] text-white`
                        : 'bg-black/35 hover:bg-white/5 border-white/5 hover:border-white/20 text-stone-300'
                    }`}
                    title={`Switch to ${opt.label} atmosphere`}
                  >
                    {/* Active Top Glowing Indicator */}
                    {isActive && (
                      <span className="absolute -top-0.5 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent rounded-full shadow-[0_0_8px_#38bdf8]" />
                    )}

                    {/* Emoji + Icon Header */}
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-sm group-hover:scale-115 transition-transform duration-200">
                        {opt.emoji}
                      </span>
                    </div>

                    {/* Label */}
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wide mt-0.5 ${
                        isActive ? opt.activeColor : 'text-stone-300 group-hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </span>

                    {/* Japanese Subtext */}
                    <span className="text-[8px] text-stone-400/80 group-hover:text-stone-300 transition-colors">
                      {opt.subLabel}
                    </span>

                    {/* Active Pulsing Dot */}
                    {isActive && (
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#38bdf8] animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quality Mode Indicator & Quick Switcher (Auto-detected, user-toggleable) */}
            <div className="mt-1 pt-1.5 border-t border-white/10 flex items-center justify-between gap-2 px-1 text-[10px]">
              <div className="flex items-center gap-1.5 text-stone-300">
                <Gauge size={12} className={tierColors[tier].text} />
                <span className="text-[9px] uppercase tracking-wider text-stone-400">QUALITY:</span>
                <span className={`text-[10px] font-bold uppercase ${tierColors[tier].text}`}>
                  {tier}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5">
                {(['high', 'balanced', 'performance'] as PerformanceTier[]).map((t) => {
                  const isCurrent = tier === t;
                  return (
                    <button
                      key={t}
                      onClick={() => handleTierChange(t)}
                      className={`cursor-pointer px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition-all ${
                        isCurrent
                          ? `${tierColors[t].bg} ${tierColors[t].text} ${tierColors[t].border} border shadow-xs`
                          : 'text-stone-400 hover:text-white hover:bg-white/5'
                      }`}
                      title={`Switch to ${t.toUpperCase()} mode`}
                    >
                      {t === 'performance' ? 'PERF' : t === 'balanced' ? 'BAL' : 'HIGH'}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          /* ==========================================================
             COMPACT FLOATING ANIME ATMOSPHERE ORB (MINIMIZED)
             ========================================================== */
          <motion.button
            key="atmosphere-pill-minimized"
            initial={{ opacity: 0, scale: 0.85, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -10 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playSfx('show');
              setIsCollapsed(false);
            }}
            className={`cursor-pointer group flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-2xl bg-[#0b0c1b]/95 border ${currentConfig.borderColor} backdrop-blur-xl shadow-[0_6px_25px_rgba(0,0,0,0.6),0_0_18px_${currentConfig.glowColor}] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400`}
            title="Open Atmosphere & Performance Settings"
            aria-label="Open Atmosphere"
          >
            <span className="text-sm group-hover:rotate-12 transition-transform">
              {currentConfig.emoji}
            </span>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-white flex items-center gap-1">
                <span>ATMOSPHERE:</span>
                <span className={currentConfig.activeColor}>{currentConfig.label}</span>
              </span>
              <div className="flex items-center gap-1.5 text-[8px] text-stone-400 font-normal">
                <span>{currentConfig.subLabel}</span>
                <span className="text-stone-600">•</span>
                <span className={`uppercase font-semibold ${tierColors[tier].text}`}>
                  {tier === 'performance' ? 'PERF' : tier}
                </span>
              </div>
            </div>
            <Eye size={12} className="text-stone-400 group-hover:text-sky-300 ml-0.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

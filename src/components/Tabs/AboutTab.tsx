import React, { useState, useEffect } from 'react';
import { Compass, MapPin, Clock, Target, Heart, CheckCircle2, ShieldCheck } from 'lucide-react';
import { WOLFEY_DATA } from '../../data/wolfeyData';
import { AnimatedScrollContainer } from '../AnimatedScrollContainer';

export const AboutTab: React.FC = () => {
  const [indiaTime, setIndiaTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Indian Standard Time is UTC+5:30
      const istString = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setIndiaTime(istString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatedScrollContainer maxHeightClass="max-h-[520px] sm:max-h-[580px]">
      <div id="about-tab-content" className="flex flex-col gap-4 text-left py-1">
        {/* Primary Statement Quote */}
        <div className="relative p-5 sm:p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md shadow-lg overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2 text-xs font-semibold text-sky-300 uppercase tracking-wider mb-2">
            <Compass size={15} />
            <span>Biography & Mission</span>
          </div>

          <p className="text-sm sm:text-base text-stone-100 leading-relaxed font-normal">
            {WOLFEY_DATA.aboutText}
          </p>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs text-stone-400">
            <span className="flex items-center gap-1.5 text-stone-300">
              <MapPin size={13} className="text-rose-400" />
              <span>Based in <strong className="text-white">India {WOLFEY_DATA.locationFlag}</strong></span>
            </span>
            <span className="flex items-center gap-1.5 font-mono text-sky-300 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              <Clock size={12} />
              <span>IST {indiaTime || 'Live'}</span>
            </span>
          </div>
        </div>

        {/* Creative Philosophy & Focus */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-black/35 border border-white/10 backdrop-blur-md flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider">
              <Target size={14} />
              <span>Creative Vision</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Bridging cutting-edge technical programming with expressive audiovisual arts. Transforming concepts into polished, living experiences.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/35 border border-white/10 backdrop-blur-md flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-300 uppercase tracking-wider">
              <Compass size={14} />
              <span>Core Disciplines</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Specialized in Unreal Engine 5 real-time graphics, sound design, anime edits, full-stack programming, and visual art.
            </p>
          </div>
        </div>

        {/* Specialties Checklist */}
        <div className="p-4 sm:p-5 rounded-2xl bg-black/35 border border-white/10 backdrop-blur-md flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-200 uppercase tracking-wider">
            <ShieldCheck size={15} className="text-emerald-400" />
            <span>Technical & Artistic Capabilities</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-sky-400" />
              <span>Full-Cycle Game Prototyping</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-sky-400" />
              <span>Cinematic AMV & Video Direction</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-sky-400" />
              <span>Music Making & Melody Composition</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-sky-400" />
              <span>9:16 Portrait Visual Art & Illustration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-sky-400" />
              <span>Interactive Web Application Dev</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-sky-400" />
              <span>3D Modeling & Environment Lighting</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-sky-400" />
              <span>High-Impact Graphic Key Visuals</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-sky-400" />
              <span>Character Rigging & Motion Loops</span>
            </div>
          </div>
        </div>
      </div>
    </AnimatedScrollContainer>
  );
};

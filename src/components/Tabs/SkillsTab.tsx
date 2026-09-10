import React, { useState } from 'react';
import { SkillItem } from '../../types';
import {
  Code2,
  Layers,
  CheckCircle2,
  ChevronRight,
  Music,
  Palette,
  Wrench,
  ArrowRight,
  Terminal,
  Cpu,
  Zap,
  Briefcase,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { registerRealClick } from '../../lib/firebase';
import { playSfx } from '../../lib/soundManager';
import { AnimatedScrollContainer } from '../AnimatedScrollContainer';
import { ArtistSection } from '../ArtistSection';

interface SkillsTabProps {
  skills: SkillItem[];
  onNavigateToTools?: () => void;
  onNavigateToPaidWork?: () => void;
}

export const SkillsTab: React.FC<SkillsTabProps> = ({
  skills,
  onNavigateToTools,
  onNavigateToPaidWork,
}) => {
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  const selectedSkill = skills.find((s) => s.id === selectedSkillId) || skills[0];

  const handleSelectSkill = (skill: SkillItem) => {
    setSelectedSkillId(skill.id);
    registerRealClick(`skill_${skill.id}`);
  };

  return (
    <AnimatedScrollContainer maxHeightClass="max-h-[520px] sm:max-h-[580px]">
      <div id="skills-tab-content" className="flex flex-col gap-4 text-left py-1">
        {/* Header Info */}
        <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md flex flex-col gap-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sky-300 text-xs font-semibold uppercase tracking-wider">
              <Code2 size={15} />
              <span>Interactive Disciplines</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-stone-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                {skills.length} Creative Disciplines
              </span>
              {onNavigateToPaidWork && (
                <button
                  onClick={() => {
                    playSfx('nav');
                    onNavigateToPaidWork();
                  }}
                  className="flex items-center gap-1.5 text-[11px] font-mono text-sky-300 hover:text-white bg-sky-500/15 hover:bg-sky-500/30 px-2.5 py-0.5 rounded-full border border-sky-400/40 transition-all cursor-pointer shadow-[0_0_10px_rgba(56,189,248,0.2)]"
                >
                  <Briefcase size={12} />
                  <span>Hire / Paid Work →</span>
                </button>
              )}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Crafting rich audiovisual experiences spanning game design, programming, full-stack software development, music production, digital art illustration, video editing, 3D graphics, and character animation.
          </p>
        </div>

        {/* Grid of Interactive Skill Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {skills.map((skill) => {
            const isSelected = selectedSkill.id === skill.id;

            return (
              <motion.div
                key={skill.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleSelectSkill(skill)}
                className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-300 border backdrop-blur-md flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? 'bg-black/60 border-sky-400/60 shadow-[0_0_25px_rgba(56,189,248,0.25)]'
                    : 'bg-black/35 border-white/10 hover:border-sky-300/40 hover:bg-white/5'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <span className="text-2xl filter drop-shadow">{skill.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white transition-colors flex items-center gap-1.5 group-hover:text-sky-300">
                          {skill.title}
                        </h3>
                        <span className="text-[11px] block font-medium text-stone-400">
                          {skill.tagline}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md border text-sky-300 bg-sky-400/10 border-sky-400/20">
                      {skill.level}%
                    </span>
                  </div>

                  <p className="text-xs text-stone-300 leading-relaxed line-clamp-2">
                    {skill.description}
                  </p>
                </div>

                {/* Progress Bar & Tech Pills */}
                <div className="mt-3 pt-2.5 border-t border-white/10">
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-2.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: skill.accentColor }}
                    />
                  </div>

                  <div className="flex items-center gap-1 flex-wrap">
                    {skill.technologies.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded border bg-white/5 text-stone-300 border-white/5"
                      >
                        {tech}
                      </span>
                    ))}
                    {skill.technologies.length > 3 && (
                      <span className="text-[10px] font-mono text-stone-400">
                        +{skill.technologies.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* In-Depth Skill Detail Card */}
        <AnimatePresence mode="wait">
          {selectedSkill && (
            <motion.div
              key={selectedSkill.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="p-4 sm:p-5 rounded-2xl border backdrop-blur-lg flex flex-col gap-3.5 shadow-xl relative overflow-hidden bg-black/50 border-sky-400/30"
            >
              <div className="relative z-10 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/20"
                    style={{ backgroundColor: `${selectedSkill.accentColor}25` }}
                  >
                    {selectedSkill.icon}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      {selectedSkill.title}
                      <span className="text-xs font-normal text-stone-400">
                        • {selectedSkill.tagline}
                      </span>
                    </h4>
                    <div className="text-xs text-sky-300 font-mono mt-0.5 flex items-center gap-2">
                      <span>Proficiency Score: {selectedSkill.level}/100</span>
                      {selectedSkill.id === 'skill-ai-developer' && (
                        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/20 px-2 py-0.2 rounded border border-cyan-400/40">
                          FULL STACK • REACT • TYPESCRIPT
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {onNavigateToPaidWork && (
                  <button
                    onClick={() => {
                      playSfx('nav');
                      onNavigateToPaidWork();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 text-xs font-mono font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(56,189,248,0.2)]"
                  >
                    <Briefcase size={13} />
                    <span>Book Commission →</span>
                  </button>
                )}
              </div>

              <p className="relative z-10 text-xs sm:text-sm text-stone-200 leading-relaxed">
                {selectedSkill.description}
              </p>

              {/* Full-Stack Code & Engineering Highlights */}
              {selectedSkill.id === 'skill-ai-developer' && (
                <div className="relative z-10 p-3 rounded-xl bg-gradient-to-r from-sky-950/40 via-black/60 to-sky-900/30 border border-sky-400/30 flex items-center justify-between flex-wrap gap-2 text-xs text-sky-200">
                  <div className="flex items-center gap-2.5">
                    <Terminal size={16} className="text-sky-400" />
                    <div>
                      <span className="font-mono font-bold text-white">Full-Stack Code & Engineering:</span>{' '}
                      <span className="text-stone-300 text-xs">Hand-crafted architecture, modular reactive components, and clean production builds.</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-sky-400/20 text-sky-300 border border-sky-400/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>PRODUCTION READY</span>
                  </span>
                </div>
              )}

              {/* Special Badge for Music Maker */}
              {selectedSkill.id === 'skill-music-maker' && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between flex-wrap gap-2 text-xs text-purple-200">
                  <div className="flex items-center gap-2">
                    <Music size={15} className="text-purple-400 animate-pulse" />
                    <span>Website Background Track: <strong>Fire Voxy - NO WAY BACK</strong></span>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-400/20 text-purple-300 border border-purple-400/30">
                    Active BGM
                  </span>
                </div>
              )}

              {/* Capabilities & Toolset */}
              <div className="relative z-10 p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-xs font-mono font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench size={13} className="text-sky-400" />
                    <span>TECH STACK & TOOLS I USE // 使用ツール</span>
                  </div>

                  {onNavigateToTools && (
                    <button
                      onClick={() => {
                        playSfx('nav');
                        onNavigateToTools();
                      }}
                      className="flex items-center gap-1 text-[11px] font-mono text-cyan-300 hover:text-cyan-200 bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-400/30 transition-colors cursor-pointer"
                    >
                      <span>Explore in Tools & Workflow</span>
                      <ArrowRight size={11} />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {selectedSkill.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-medium bg-sky-500/10 text-white border-sky-400/30"
                    >
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* If Artist skill is selected, show the Artist Gallery Section directly */}
              {selectedSkill.id === 'skill-artist' && (
                <div className="mt-2 pt-3 border-t border-pink-500/20">
                  <ArtistSection />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedScrollContainer>
  );
};


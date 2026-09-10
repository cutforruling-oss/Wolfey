import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wrench,
  Flame,
  Layers,
  ChevronRight,
  ExternalLink,
  Code2,
  Cpu,
  Palette,
  Gamepad2,
  Film,
  Music,
  Box,
  CheckCircle2,
  HelpCircle,
  X,
  Compass,
} from 'lucide-react';
import { CREATIVE_TOOLS, WORKFLOW_PIPELINE, ToolItem, ToolStatus } from '../../data/toolsData';
import { playSfx } from '../../lib/soundManager';
import { registerRealClick } from '../../lib/firebase';
import { AnimatedScrollContainer } from '../AnimatedScrollContainer';

const DOMAIN_FILTERS = [
  { id: 'all', label: 'All Tools', icon: <Wrench size={13} /> },
  { id: 'Game Dev', label: 'Game Dev', icon: <Gamepad2 size={13} /> },
  { id: '3D & VFX', label: '3D & Models', icon: <Box size={13} /> },
  { id: 'Coding', label: 'Coding', icon: <Code2 size={13} /> },
  { id: 'Graphic Design', label: 'Design & UI', icon: <Palette size={13} /> },
  { id: 'Video Editing', label: 'Video & VFX', icon: <Film size={13} /> },
  { id: 'Animation', label: 'Animation', icon: <Flame size={13} /> },
  { id: 'Music & Audio', label: 'Music & Audio', icon: <Music size={13} /> },
  { id: 'Digital Art', label: 'Digital Art', icon: <Palette size={13} /> },
];

const STATUS_CONFIG: Record<ToolStatus, { label: string; bg: string; text: string; border: string }> = {
  USED: {
    label: 'I USE THIS',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    border: 'border-emerald-400/40',
  },
  LEARNING: {
    label: 'LEARNING',
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-400/40',
  },
  EXPLORING: {
    label: 'EXPLORING',
    bg: 'bg-sky-500/15',
    text: 'text-sky-300',
    border: 'border-sky-400/40',
  },
  'WORKFLOW TOOL': {
    label: 'WORKFLOW TOOL',
    bg: 'bg-purple-500/15',
    text: 'text-purple-300',
    border: 'border-purple-400/40',
  },
};

export const ToolsTab: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);

  const filteredTools = useMemo(() => {
    if (selectedDomain === 'all') return CREATIVE_TOOLS;
    return CREATIVE_TOOLS.filter((t) => t.domain === selectedDomain);
  }, [selectedDomain]);

  const handleDomainChange = (domainId: string) => {
    playSfx('nav');
    setSelectedDomain(domainId);
    registerRealClick(`tools_filter_${domainId}`);
  };

  const handleToolClick = (tool: ToolItem) => {
    playSfx('projects');
    setSelectedTool(tool);
    registerRealClick(`tool_view_${tool.id}`);
  };

  return (
    <AnimatedScrollContainer maxHeightClass="max-h-[540px] sm:max-h-[600px]">
      <div id="tools-workflow-content" className="flex flex-col gap-5 text-left py-1">
        {/* Section Header */}
        <div className="p-4 sm:p-5 rounded-2xl bg-black/45 border border-sky-400/30 backdrop-blur-md flex flex-col gap-2 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sky-300 text-xs font-bold uppercase tracking-wider">
              <Wrench size={15} className="text-sky-400" />
              <span>Creative Workstation & Tech Stack</span>
            </div>
            <span className="text-[11px] font-mono text-stone-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
              {CREATIVE_TOOLS.length} Software & Technologies
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
            TOOLS & WORKFLOW
          </h2>

          <p className="text-xs sm:text-sm text-stone-300 italic leading-relaxed">
            “The tools I use to turn ideas into games, art, animation and digital experiences.”
          </p>

          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/10 text-[10px] font-mono">
            <span className="text-stone-400">Honest Classification:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">
              ● USED (Active Skill)
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-400/30 text-amber-300">
              ● LEARNING (Studying)
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-500/15 border border-purple-400/30 text-purple-300">
              ● WORKFLOW TOOL (Studio Standard)
            </span>
          </div>
        </div>

        {/* 3D MODEL MAKING PIPELINE WORKFLOW (Special Highlight) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0c0f24]/90 via-[#0a0c1a]/85 to-[#16122c]/90 border border-sky-400/40 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Box size={16} className="text-cyan-400 animate-pulse" />
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase font-mono">
                3D Model Making Pipeline // 3D制作パイプライン
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-400/30">
              8 Step Standard Workflow
            </span>
          </div>

          <p className="text-xs text-stone-300">
            Click each step in the pipeline below to inspect the industry 3D production pipeline used by Wolfey:
          </p>

          {/* Interactive Steps Bar */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-1">
            {WORKFLOW_PIPELINE.map((step) => {
              const isCurrent = step.step === activeStep;
              return (
                <button
                  key={step.step}
                  onClick={() => {
                    playSfx('nav');
                    setActiveStep(step.step);
                  }}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${
                    isCurrent
                      ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105'
                      : 'bg-black/40 border-white/10 text-stone-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <span className="text-[9px] font-mono opacity-60">0{step.step}</span>
                  <span className="text-[11px] font-bold leading-tight mt-0.5">{step.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Step Details Card */}
          {WORKFLOW_PIPELINE.find((s) => s.step === activeStep) && (
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-1 p-3.5 rounded-xl bg-black/60 border border-cyan-400/30 text-xs flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-cyan-300 font-mono">
                    STEP {activeStep}: {WORKFLOW_PIPELINE[activeStep - 1].name}
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">
                    ({WORKFLOW_PIPELINE[activeStep - 1].japanese})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-stone-300">
                  Role: {WORKFLOW_PIPELINE[activeStep - 1].role}
                </span>
              </div>

              <p className="text-stone-300 leading-relaxed">
                {WORKFLOW_PIPELINE[activeStep - 1].description}
              </p>

              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/10">
                <span className="text-[10px] font-mono text-stone-400">Primary Software:</span>
                {WORKFLOW_PIPELINE[activeStep - 1].recommendedTools.map((tool) => (
                  <span
                    key={tool}
                    className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-400/30 text-cyan-200 text-[10px] font-mono font-medium"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {DOMAIN_FILTERS.map((filter) => {
            const isSelected = selectedDomain === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => handleDomainChange(filter.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                    : 'bg-black/35 border-white/10 text-stone-400 hover:text-white hover:border-white/20'
                }`}
              >
                {filter.icon}
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tools Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredTools.map((tool) => {
            const statusConfig = STATUS_CONFIG[tool.status];
            return (
              <motion.div
                key={tool.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleToolClick(tool)}
                className="group relative p-4 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 hover:border-sky-400/50 backdrop-blur-md cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-md hover:shadow-[0_0_25px_rgba(56,189,248,0.2)]"
              >
                <div>
                  {/* Top Bar: Name & Status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors flex items-center gap-1.5 font-['Plus_Jakarta_Sans']">
                        {tool.name}
                      </h4>
                      <span className="text-[10px] font-mono text-stone-400 block mt-0.5">
                        {tool.category}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider border whitespace-nowrap ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Short Description */}
                  <p className="text-xs text-stone-300 leading-relaxed line-clamp-2 mt-1">
                    {tool.shortDesc}
                  </p>
                </div>

                {/* Bottom Bar: Wolfey's Application & Tags */}
                <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-col gap-1.5">
                  <div className="text-[11px] text-sky-200/90 line-clamp-1">
                    <strong className="text-stone-400 font-mono text-[10px]">Usage:</strong>{' '}
                    {tool.wolfeyUsage}
                  </div>

                  <div className="flex items-center gap-1 flex-wrap">
                    {tool.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-stone-300 border border-white/5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Detailed Tool Modal View on Click */}
        <AnimatePresence>
          {selectedTool && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTool(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer select-none"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg rounded-2xl bg-[#0c0d1f] border border-sky-400/50 p-5 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(56,189,248,0.25)] flex flex-col gap-4 text-left cursor-default overflow-hidden"
              >
                {/* Close Button */}
                <button
                  onClick={() => {
                    playSfx('hide');
                    setSelectedTool(null);
                  }}
                  className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>

                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black text-white font-['Plus_Jakarta_Sans']">
                      {selectedTool.name}
                    </h3>
                    <div className="text-xs font-mono text-sky-300 mt-0.5">
                      Domain: {selectedTool.domain} • {selectedTool.category}
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider border ${
                      STATUS_CONFIG[selectedTool.status].bg
                    } ${STATUS_CONFIG[selectedTool.status].text} ${
                      STATUS_CONFIG[selectedTool.status].border
                    }`}
                  >
                    {STATUS_CONFIG[selectedTool.status].label}
                  </span>
                </div>

                {/* Description */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-stone-200 leading-relaxed">
                  {selectedTool.shortDesc}
                </div>

                {/* What Wolfey Uses It For */}
                <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-400/30 flex flex-col gap-1.5">
                  <span className="text-xs font-mono font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-sky-400" />
                    How Wolfey Uses This Tool
                  </span>
                  <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                    {selectedTool.wolfeyUsage}
                  </p>
                  {selectedTool.experienceLevel && (
                    <div className="text-[11px] font-mono text-stone-400 pt-1">
                      Status Level:{' '}
                      <strong className="text-white">{selectedTool.experienceLevel}</strong>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-xs font-mono text-stone-400">Key Features:</span>
                  {selectedTool.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-xs font-mono text-stone-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedScrollContainer>
  );
};

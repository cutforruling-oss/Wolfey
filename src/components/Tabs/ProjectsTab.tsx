import React, { useState } from 'react';
import { ProjectItem } from '../../types';
import { ExternalLink, Calendar, Layers, Eye, Play, Clock, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { registerRealClick } from '../../lib/firebase';
import { playSfx } from '../../lib/soundManager';
import { ComingSoonCard } from '../ComingSoonCard';
import { AnimatedScrollContainer } from '../AnimatedScrollContainer';

interface ProjectsTabProps {
  projects: ProjectItem[];
}

type ProjectCategory = 'All' | 'Games' | 'Websites' | 'Graphics' | 'Animations' | 'Video Edits' | '3D Designs' | 'Anime Art' | 'Coming Soon';

const UPCOMING_PRODUCTIONS = [
  {
    id: 'cs-chrono-shift',
    title: 'Project Chrono: Shift (Anime ARPG)',
    category: 'Games',
    discipline: 'Game Development',
    conceptPreview: 'High-speed fast-paced anime action RPG combat prototype featuring real-time weapon swapping, dash cancels, and stylized cel-shaded character VFX in Unreal Engine 5.',
    targetQuarter: 'Q3 2026',
    productionPhase: 'Combat Mechanics & State Machines',
    toolsUsed: ['Unreal Engine 5', 'Blender', 'C++', 'Niagara VFX', 'Substance Painter'],
  },
  {
    id: 'cs-cyber-valkyrie',
    title: 'Cyber Valkyrie: Type-09',
    category: '3D Designs',
    discipline: '3D Character Model',
    conceptPreview: 'Full-body game-ready stylized 3D anime mecha-pilot heroine with quad-dominant retopology, high-poly ZBrush hair strands, and PBR cel-shaded materials.',
    targetQuarter: 'Q2 2026',
    productionPhase: 'Retopology & Facial Blendshapes',
    toolsUsed: ['ZBrush', 'Blender', 'Substance 3D Painter', 'Maya Quad Draw'],
  },
  {
    id: 'cs-kitsune-blade',
    title: 'Kitsune Blade: Episode 01 Cut',
    category: 'Animations',
    discipline: '2D/3D Hybrid Anime Short',
    conceptPreview: 'Cinematic anime duel sequence incorporating hand-drawn impact frames, speed line distortion shaders, and 3D camera pan-downs across a neon-lit cyber shrine.',
    targetQuarter: 'Q4 2026',
    productionPhase: 'Keyframe Roughs & Timing Passes',
    toolsUsed: ['Toon Boom Harmony', 'Blender Grease Pencil', 'Clip Studio Paint', 'After Effects'],
  },
  {
    id: 'cs-neon-amv-02',
    title: 'Neon Horizon: Overdrive AMV',
    category: 'Video Edits',
    discipline: 'Velocity Motion Edit',
    conceptPreview: 'High-impact sync montage pairing heavy bass drops with frame-by-frame masking, optical flow speed ramps, and chromatic glitch typography.',
    targetQuarter: 'Summer 2026',
    productionPhase: 'Music Beat-Grid Assembly',
    toolsUsed: ['DaVinci Resolve Studio', 'After Effects', 'Sapphire Plugins', 'FL Studio'],
  },
];

export const ProjectsTab: React.FC<ProjectsTabProps> = ({ projects }) => {
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>('All');
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);

  const categories: ProjectCategory[] = [
    'All',
    'Games',
    'Websites',
    'Graphics',
    'Animations',
    'Video Edits',
    '3D Designs',
    'Anime Art',
    'Coming Soon',
  ];

  const filteredProjects = projects.filter((p) => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Coming Soon') return false;
    return p.category === selectedCategory;
  });

  const filteredUpcoming = UPCOMING_PRODUCTIONS.filter((u) => {
    if (selectedCategory === 'All' || selectedCategory === 'Coming Soon') return true;
    return u.category === selectedCategory;
  });

  const handleProjectClick = (proj: ProjectItem) => {
    playSfx('projects');
    setActiveProject(proj);
    registerRealClick(`project_${proj.id}`);
  };

  const handleCategorySelect = (cat: ProjectCategory) => {
    playSfx('projects');
    setSelectedCategory(cat);
    registerRealClick(`proj_cat_${cat}`);
  };

  return (
    <AnimatedScrollContainer maxHeightClass="max-h-[540px] sm:max-h-[600px]">
      <div id="projects-tab-content" className="flex flex-col gap-4 text-left py-1">
        {/* Category Pills Slider */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const isComingSoonPill = cat === 'Coming Soon';
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap cursor-pointer transition-all duration-200 flex items-center gap-1 ${
                  isActive
                    ? isComingSoonPill
                      ? 'bg-pink-500/25 text-pink-200 border border-pink-400/50 shadow-[0_0_15px_rgba(244,114,182,0.3)]'
                      : 'bg-sky-400/25 text-sky-200 border border-sky-400/40 shadow-sm'
                    : isComingSoonPill
                    ? 'bg-pink-500/10 text-pink-300 hover:bg-pink-500/20 border border-pink-400/20'
                    : 'bg-white/5 text-stone-300 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                {isComingSoonPill && <Flame size={11} className="text-pink-400" />}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Existing Projects List */}
        <div className="grid grid-cols-1 gap-3.5">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => handleProjectClick(project)}
              className="group relative p-3.5 sm:p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md cursor-pointer transition-all duration-300 hover:border-sky-300/40 hover:bg-white/5 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
            >
              {/* Thumbnail in 9:16 portrait style */}
              <div className="relative w-full sm:w-[110px] h-[160px] sm:h-[140px] rounded-xl overflow-hidden flex-shrink-0 bg-stone-900 border border-white/10">
                <img
                  src={project.mediaUrl}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ aspectRatio: '9 / 16' }}
                  loading="lazy"
                />
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-mono font-medium text-sky-200 border border-white/10">
                  {project.category}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                    {project.title}
                  </h3>
                  <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1">
                    <Calendar size={11} className="text-sky-400" />
                    {project.year}
                  </span>
                </div>

                <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed mb-2.5">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300 border border-sky-400/25">
                    {project.badge}
                  </span>
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-stone-300 border border-white/5"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Premium COMING SOON Visual Cards for in-production slots */}
          {filteredUpcoming.length > 0 && (
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-mono font-bold text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame size={13} className="text-pink-400" />
                  In Production // Coming Soon
                </span>
                <span className="text-[10px] font-mono text-stone-400">
                  Slots undergoing active creative development
                </span>
              </div>

              {filteredUpcoming.map((upcoming) => (
                <ComingSoonCard
                  key={upcoming.id}
                  id={upcoming.id}
                  title={upcoming.title}
                  category={upcoming.category}
                  discipline={upcoming.discipline}
                  conceptPreview={upcoming.conceptPreview}
                  targetQuarter={upcoming.targetQuarter}
                  productionPhase={upcoming.productionPhase}
                  toolsUsed={upcoming.toolsUsed}
                />
              ))}
            </div>
          )}
        </div>

        {/* Project Modal Preview */}
        <AnimatePresence>
          {activeProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveProject(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg p-5 sm:p-6 rounded-2xl bg-[#14141e] border border-sky-400/30 text-left shadow-2xl overflow-hidden flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono text-sky-300 uppercase tracking-wider font-semibold">
                      {activeProject.category} • {activeProject.year}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                      {activeProject.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveProject(null)}
                    className="cursor-pointer text-stone-400 hover:text-white p-1 rounded-lg bg-white/5"
                  >
                    ✕
                  </button>
                </div>

                {/* 9:16 Preview image */}
                <div className="relative w-full max-h-[300px] rounded-xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center">
                  <img
                    src={activeProject.mediaUrl}
                    alt={activeProject.title}
                    className="max-h-[300px] w-auto object-contain rounded-lg"
                  />
                </div>

                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                  {activeProject.description}
                </p>

                <div>
                  <div className="text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                    Core Highlights:
                  </div>
                  <ul className="space-y-1">
                    {activeProject.features.map((feat, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-stone-300 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                {activeProject.liveUrl && (
                  <div className="pt-2">
                    <a
                      href={activeProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => registerRealClick(`proj_external_${activeProject.id}`)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-black font-semibold text-xs transition-all hover:bg-sky-400 cursor-pointer"
                    >
                      <span>View Live Showcase</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedScrollContainer>
  );
};

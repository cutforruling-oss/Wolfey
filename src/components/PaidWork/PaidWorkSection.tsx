import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase,
  Send,
  MessageSquare,
  Clock,
  Calendar,
  Layers,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { PAID_SERVICES } from '../../data/wolfeyData';
import { PaidServiceItem } from '../../types';
import { WorkRequestModal } from './WorkRequestModal';
import { CustomQuoteModal } from './CustomQuoteModal';
import { AnimatedScrollContainer } from '../AnimatedScrollContainer';
import { playSfx } from '../../lib/soundManager';
import { registerRealClick } from '../../lib/firebase';

const DISCORD_URL = 'https://discord.com/users/874238077546168320';
const DISCORD_USERNAME = 'dev_arie';

export const PaidWorkSection: React.FC = () => {
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<PaidServiceItem | null>(null);
  const [selectedServiceForQuote, setSelectedServiceForQuote] = useState<PaidServiceItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'game-3d' | 'code-dev' | 'visual-art' | 'audio'>('all');
  const [discordCopied, setDiscordCopied] = useState(false);

  const categories = [
    { id: 'all', label: 'ALL SERVICES (10)' },
    { id: 'game-3d', label: 'GAME & 3D (3)' },
    { id: 'code-dev', label: 'CODING & DEV (2)' },
    { id: 'visual-art', label: 'DESIGN & ART (4)' },
    { id: 'audio', label: 'MUSIC & AUDIO (1)' },
  ] as const;

  const filteredServices = PAID_SERVICES.filter((service) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'game-3d') {
      return ['srv-game-designer', 'srv-3d-designer', 'srv-3d-model-maker'].includes(service.id);
    }
    if (activeCategory === 'code-dev') {
      return ['srv-coder-programmer', 'srv-ai-developer'].includes(service.id);
    }
    if (activeCategory === 'visual-art') {
      return ['srv-graphic-designer', 'srv-video-editor', 'srv-animation-creator', 'srv-artist'].includes(service.id);
    }
    if (activeCategory === 'audio') {
      return service.id === 'srv-music-maker';
    }
    return true;
  });

  const handleCopyDiscord = () => {
    navigator.clipboard.writeText(DISCORD_USERNAME);
    playSfx('nav');
    setDiscordCopied(true);
    setTimeout(() => setDiscordCopied(false), 2000);
    registerRealClick('copy_discord_paid_work_header');
  };

  const handleBookWork = (service: PaidServiceItem) => {
    playSfx('nav');
    setSelectedServiceForBooking(service);
    registerRealClick(`book_work_click_${service.id}`);
  };

  const handleCustomQuote = (service: PaidServiceItem) => {
    playSfx('nav');
    setSelectedServiceForQuote(service);
    registerRealClick(`custom_quote_click_${service.id}`);
  };

  return (
    <AnimatedScrollContainer maxHeightClass="max-h-[560px] sm:max-h-[620px]">
      <div id="paid-work-content" className="flex flex-col gap-5 text-left py-1">
        {/* Section Title Banner (Anime × Cinematic 3D × Futuristic UI) */}
        <div className="relative p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-black/80 via-stone-950/70 to-black/80 border border-sky-400/30 backdrop-blur-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6),0_0_25px_rgba(56,189,248,0.12)]">
          {/* Subtle Cyber Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

          {/* Glowing Ambient Halo */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                <span className="text-[11px] font-mono tracking-widest text-sky-400 uppercase font-bold flex items-center gap-1.5">
                  <Briefcase size={13} />
                  <span>COMMISSION SYSTEM // 依頼受付中</span>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5 font-['Cinzel']">
                <span>💼</span>
                <span className="bg-gradient-to-r from-white via-stone-100 to-sky-200 bg-clip-text text-transparent">
                  PAID WORK
                </span>
              </h2>

              <p className="text-sm sm:text-base font-semibold text-sky-200/90 mt-1 italic">
                "Need something created? Let's build it together."
              </p>

              <p className="text-xs text-stone-300 mt-1">
                Professional creative & digital services by Wolfey. Flexible pricing adapted to project size, timeline, and scope.
              </p>
            </div>

            {/* Quick Discord Contact Card */}
            <div className="sm:shrink-0 p-3 rounded-xl bg-black/60 border border-[#5865F2]/40 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-mono text-stone-300">Discord:</span>
                <span className="font-mono text-sky-300 font-bold">{DISCORD_USERNAME}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <a
                  href={DISCORD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    playSfx('nav');
                    registerRealClick('discord_header_button');
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(88,101,242,0.3)]"
                >
                  <Send size={12} />
                  <span>Chat on Discord</span>
                </a>
                <button
                  onClick={handleCopyDiscord}
                  className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white text-xs font-mono transition-colors"
                  title="Copy Discord Tag"
                >
                  {discordCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          </div>

          {/* Work Duration Scenarios / Scoping Guide */}
          <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-mono text-stone-300">
            <div className="p-2 rounded-lg bg-black/40 border border-white/5">
              <div className="text-amber-400 font-bold flex items-center gap-1">
                <span>⚡</span>
                <span>QUICK WORK</span>
              </div>
              <div className="text-[10px] text-stone-400">Few hours / task</div>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-white/5">
              <div className="text-sky-400 font-bold flex items-center gap-1">
                <span>🕐</span>
                <span>SHORT PROJECT</span>
              </div>
              <div className="text-[10px] text-stone-400">1–3 days</div>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-white/5">
              <div className="text-purple-400 font-bold flex items-center gap-1">
                <span>📅</span>
                <span>MEDIUM PROJECT</span>
              </div>
              <div className="text-[10px] text-stone-400">Days to weeks</div>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-white/5">
              <div className="text-pink-400 font-bold flex items-center gap-1">
                <span>📆</span>
                <span>LONG PROJECT</span>
              </div>
              <div className="text-[10px] text-stone-400">Weeks to months</div>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-white/5 col-span-2 sm:col-span-1">
              <div className="text-emerald-400 font-bold flex items-center gap-1">
                <span>♾️</span>
                <span>ONGOING</span>
              </div>
              <div className="text-[10px] text-stone-400">Monthly retainer</div>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                playSfx('nav');
                setActiveCategory(cat.id);
                registerRealClick(`filter_paid_work_${cat.id}`);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all duration-300 border shrink-0 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-sky-500/20 text-sky-200 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                  : 'bg-black/40 text-stone-400 border-white/10 hover:border-white/20 hover:text-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Service Cards Grid (Anime × Cinematic 3D × Futuristic UI) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              whileHover={{ y: -3 }}
              className="group relative p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-black/75 via-stone-900/60 to-black/85 border border-white/10 hover:border-sky-400/50 backdrop-blur-md transition-all duration-300 flex flex-col justify-between shadow-[0_8px_25px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_35px_rgba(56,189,248,0.15)]"
            >
              {/* Subtle top accent bar */}
              <div
                className="absolute top-0 left-6 right-6 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: service.accentColor }}
              />

              <div>
                {/* Header: Icon, Title & Starting Rate */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-white/15 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: `${service.accentColor}20` }}
                    >
                      {service.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                        {service.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                          Starting From
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Price Badge in INR + USD */}
                  <div className="text-right">
                    <div className="text-base sm:text-lg font-black font-mono text-white tracking-tight">
                      ₹{service.pricing.startingInr.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-mono text-sky-300 font-semibold">
                      ≈ ${service.pricing.startingUsd} USD
                    </div>
                  </div>
                </div>

                {/* Service Description */}
                <p className="text-xs text-stone-300 leading-relaxed min-h-[38px] mb-3">
                  {service.service}
                </p>

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-stone-300 border border-white/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Flexible Pricing Breakdown (Hourly, Daily, Monthly, Project) */}
                <div className="p-3 rounded-xl bg-black/50 border border-white/10 mb-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-300 pb-1.5 border-b border-white/10">
                    <span className="flex items-center gap-1 text-stone-400">
                      <Clock size={12} className="text-sky-400" />
                      <span>Hourly Rate:</span>
                    </span>
                    <span className="font-bold text-white">
                      ₹{service.pricing.hourlyInr}/hr <span className="text-[10px] text-sky-300 font-normal">≈ ${service.pricing.hourlyUsd}/hr</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-300 pb-1.5 border-b border-white/10">
                    <span className="flex items-center gap-1 text-stone-400">
                      <Calendar size={12} className="text-emerald-400" />
                      <span>Daily Rate:</span>
                    </span>
                    <span className="font-bold text-white">
                      ₹{service.pricing.dailyInr}/day <span className="text-[10px] text-emerald-300 font-normal">≈ ${service.pricing.dailyUsd}/day</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-300 pb-1.5 border-b border-white/10">
                    <span className="flex items-center gap-1 text-stone-400">
                      <Layers size={12} className="text-purple-400" />
                      <span>Monthly Ongoing:</span>
                    </span>
                    <span className="font-bold text-white">
                      ₹{service.pricing.monthlyInr.toLocaleString()}/mo <span className="text-[10px] text-purple-300 font-normal">≈ ${service.pricing.monthlyUsd}/mo</span>
                    </span>
                  </div>

                  {/* Work Size Tiers (Small / Medium / Large) */}
                  <div className="pt-1 flex items-center justify-between gap-2 text-[10px] font-mono text-stone-400">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Small: ₹{service.pricing.smallInr}+</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>Med: ₹{service.pricing.mediumInr}+</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span>Large: Custom</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: [ 📩 BOOK WORK ] and [ 💬 GET CUSTOM QUOTE ] */}
              <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                <button
                  onClick={() => handleBookWork(service)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/40 hover:border-sky-300 text-xs font-mono font-bold tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(56,189,248,0.2)] cursor-pointer"
                >
                  <span>📩 BOOK WORK</span>
                </button>

                <button
                  onClick={() => handleCustomQuote(service)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-black/60 hover:bg-white/10 text-stone-300 hover:text-white border border-white/15 hover:border-white/30 text-xs font-mono font-bold tracking-wider transition-all duration-300 cursor-pointer"
                >
                  <MessageSquare size={13} />
                  <span>GET CUSTOM QUOTE</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Commission Guarantee Notice */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-stone-300">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-white">Transparent & Direct Commission Workflow</div>
              <div className="text-stone-400 text-[11px]">
                Requirements confirmed upfront • No hidden costs • Quality deliverables
              </div>
            </div>
          </div>

          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              playSfx('nav');
              registerRealClick('paid_work_bottom_discord');
            }}
            className="flex items-center gap-1.5 text-sky-300 hover:text-white font-mono font-bold text-xs"
          >
            <span>Message dev_arie on Discord</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {selectedServiceForBooking && (
            <WorkRequestModal
              service={selectedServiceForBooking}
              onClose={() => setSelectedServiceForBooking(null)}
              onSwitchToQuote={() => {
                const s = selectedServiceForBooking;
                setSelectedServiceForBooking(null);
                setSelectedServiceForQuote(s);
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedServiceForQuote && (
            <CustomQuoteModal
              service={selectedServiceForQuote}
              onClose={() => setSelectedServiceForQuote(null)}
              onSwitchToBooking={() => {
                const s = selectedServiceForQuote;
                setSelectedServiceForQuote(null);
                setSelectedServiceForBooking(s);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </AnimatedScrollContainer>
  );
};

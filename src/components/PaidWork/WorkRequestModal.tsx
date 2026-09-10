import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, ExternalLink, Copy, Check, ShieldAlert, FileText, Send } from 'lucide-react';
import { PaidServiceItem } from '../../types';
import { playSfx } from '../../lib/soundManager';
import { registerRealClick } from '../../lib/firebase';

interface WorkRequestModalProps {
  service: PaidServiceItem;
  onClose: () => void;
  onSwitchToQuote?: () => void;
}

const DISCORD_URL = 'https://discord.com/users/874238077546168320';
const DISCORD_USERNAME = 'dev_arie';

export const WorkRequestModal: React.FC<WorkRequestModalProps> = ({
  service,
  onClose,
  onSwitchToQuote,
}) => {
  const [copied, setCopied] = useState(false);
  const [templateCopied, setTemplateCopied] = useState(false);

  const requirementsList = [
    'Your Name / Username',
    'Discord Username',
    'What exactly do you want?',
    'Detailed project description',
    'Reference images / videos / links',
    'Required size / resolution',
    'Preferred style',
    'Deadline',
    'Budget',
    'Any special requirements',
    'Number of revisions needed',
    'Any files / assets that you will provide',
  ];

  const rules = [
    'Work starts only after the requirements are clearly confirmed.',
    'Final pricing depends on project complexity.',
    'Starting prices are minimum / base prices.',
    'Complex projects may cost more.',
    'Additional revisions or major changes may have additional charges.',
    'Client must provide required references / assets on time.',
    'Deadline depends on project scope and workload.',
    'Do not send illegal, harmful or copyrighted material without proper permission.',
    'Do not request stolen / copyright-infringing work.',
    'External / reference assets must be properly licensed or provided with permission.',
    'Wolfey may refuse a project that cannot reasonably be completed.',
    'Final delivery format will be agreed before work begins.',
    'Payment terms must be agreed before starting paid work.',
    'Never display fake "payment successful" or fake booking confirmation.',
    'The website itself does not process payments directly unless an official gateway is connected.',
  ];

  const handleCopyDiscord = () => {
    navigator.clipboard.writeText(DISCORD_USERNAME);
    playSfx('nav');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    registerRealClick('copy_discord_work_modal');
  };

  const handleCopyTemplate = () => {
    const templateText = `=== WORK REQUEST FOR WOLFEY (${service.title}) ===\n` +
      `1. Name / Username: \n` +
      `2. Discord Username: \n` +
      `3. What do you want: \n` +
      `4. Detailed Description: \n` +
      `5. Reference Links: \n` +
      `6. Resolution / Dimensions: \n` +
      `7. Preferred Style: \n` +
      `8. Deadline: \n` +
      `9. Budget (INR / USD): \n` +
      `10. Special Requirements: \n` +
      `11. Revisions Needed: \n` +
      `12. Assets Provided: \n` +
      `=============================================`;
    navigator.clipboard.writeText(templateText);
    playSfx('nav');
    setTemplateCopied(true);
    setTimeout(() => setTemplateCopied(false), 2500);
    registerRealClick('copy_template_work_modal');
  };

  const handleDiscordClick = () => {
    playSfx('nav');
    registerRealClick(`book_work_discord_${service.id}`);
    window.open(DISCORD_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-2xl bg-[#0d0f14] border border-sky-400/40 rounded-2xl shadow-[0_15px_45px_rgba(0,0,0,0.8),0_0_30px_rgba(56,189,248,0.15)] text-left flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-sky-950/40 via-stone-900/40 to-black/60 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/20"
              style={{ backgroundColor: `${service.accentColor}25` }}
            >
              {service.icon}
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-sky-400 uppercase font-bold flex items-center gap-1.5">
                <FileText size={11} />
                <span>BOOK THIS SERVICE // 依頼・受注</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                {service.title}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              playSfx('hide');
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-stone-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-stone-300 custom-scrollbar">
          {/* Service Pricing Summary */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="text-[11px] font-mono text-stone-400">Starting Base Rate</div>
              <div className="text-base font-bold text-white font-mono">
                ₹{service.pricing.startingInr.toLocaleString()} <span className="text-xs text-sky-300 font-normal">≈ ${service.pricing.startingUsd} USD</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                Base price • Final quote depends on scope
              </span>
            </div>
          </div>

          {/* WHAT I NEED FROM YOU */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-mono font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-sky-400" />
                <span>WHAT I NEED FROM YOU</span>
              </h4>
              <button
                onClick={handleCopyTemplate}
                className="text-[11px] font-mono flex items-center gap-1 text-cyan-300 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/25 px-2 py-1 rounded border border-cyan-400/30 transition-colors cursor-pointer"
              >
                {templateCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{templateCopied ? 'Template Copied!' : 'Copy Template'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-black/35 border border-white/10">
              {requirementsList.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-stone-300">
                  <span className="font-mono text-sky-400 font-semibold text-[11px] shrink-0">
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}.
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PLEASE PROVIDE */}
          <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-500/20">
            <h4 className="text-xs font-mono font-bold text-sky-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>📦</span>
              <span>PLEASE PROVIDE FOR SMOOTH WORK</span>
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-stone-300 list-disc list-inside">
              <li>Complete project requirements</li>
              <li>References / moodboards / examples</li>
              <li>Correct dimensions / specifications</li>
              <li>Required source files / assets</li>
              <li>Target delivery deadline</li>
              <li>Preferred artistic or visual style</li>
              <li>Any critical instructions or constraints</li>
            </ul>
          </div>

          {/* IMPORTANT RULES & REGULATIONS */}
          <div>
            <h4 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-amber-400" />
              <span>📜 IMPORTANT RULES & REGULATIONS</span>
            </h4>
            <div className="p-3.5 rounded-xl bg-black/40 border border-amber-500/20 space-y-1.5 text-[11px] sm:text-xs text-stone-300 max-h-48 overflow-y-auto custom-scrollbar">
              {rules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="font-mono text-amber-400/80 font-bold shrink-0">
                    {idx + 1}.
                  </span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* DISCORD CONTACT CALLOUT */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#5865F2]/20 via-black/40 to-sky-900/20 border border-[#5865F2]/40">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">📩</span>
                <span className="font-mono font-bold text-white text-xs uppercase tracking-wider">
                  CONTACT WOLFEY ON DISCORD
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-stone-300 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                  Tag: <strong className="text-sky-300 font-bold">{DISCORD_USERNAME}</strong>
                </span>
                <button
                  onClick={handleCopyDiscord}
                  className="text-[11px] font-mono text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded border border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Copy Discord Username"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed mb-3">
              Please send your project requirements on Discord after clicking BOOK WORK. Wolfey reviews each request individually to confirm technical feasibility, timeline, and final quotation.
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleDiscordClick}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-mono font-bold text-xs tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(88,101,242,0.4)] cursor-pointer"
              >
                <Send size={14} />
                <span>💬 MESSAGE ON DISCORD</span>
                <ExternalLink size={12} className="opacity-70" />
              </button>

              {onSwitchToQuote && (
                <button
                  onClick={() => {
                    playSfx('nav');
                    onSwitchToQuote();
                  }}
                  className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white font-mono text-xs transition-colors cursor-pointer"
                >
                  Need Custom Quote?
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-black/50 flex items-center justify-between text-xs text-stone-400 shrink-0">
          <span className="font-mono text-[11px]">No automated fake checkout • 100% direct creator communication</span>
          <button
            onClick={() => {
              playSfx('hide');
              onClose();
            }}
            className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-white/10 text-xs font-mono transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

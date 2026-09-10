import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, ExternalLink, Copy, Check, MessageSquare, Send, HelpCircle } from 'lucide-react';
import { PaidServiceItem } from '../../types';
import { playSfx } from '../../lib/soundManager';
import { registerRealClick } from '../../lib/firebase';

interface CustomQuoteModalProps {
  service?: PaidServiceItem | null;
  onClose: () => void;
  onSwitchToBooking?: () => void;
}

const DISCORD_URL = 'https://discord.com/users/874238077546168320';
const DISCORD_USERNAME = 'dev_arie';

export const CustomQuoteModal: React.FC<CustomQuoteModalProps> = ({
  service,
  onClose,
  onSwitchToBooking,
}) => {
  const [copied, setCopied] = useState(false);
  const [templateCopied, setTemplateCopied] = useState(false);

  const quoteQuestions = [
    'What do you want created?',
    'Full project description',
    'Approximate work length (Quick task / 1-3 days / weeks / monthly)',
    'Expected delivery deadline',
    'Required visual / audio quality level',
    'References / examples / moodboards',
    'Required resolution / file format',
    'Total number of assets needed',
    'Number of review rounds / revisions',
    'Whether this is one-time or monthly ongoing work',
    'Any special software or technical requirements',
  ];

  const handleCopyDiscord = () => {
    navigator.clipboard.writeText(DISCORD_USERNAME);
    playSfx('nav');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    registerRealClick('copy_discord_quote_modal');
  };

  const handleCopyTemplate = () => {
    const templateText = `=== CUSTOM QUOTE INQUIRY FOR WOLFEY ===\n` +
      `Service: ${service ? service.title : 'Custom Project'}\n` +
      `1. What do you want created: \n` +
      `2. Project Description: \n` +
      `3. Approximate Work Length: \n` +
      `4. Expected Deadline: \n` +
      `5. Required Quality: \n` +
      `6. References / Links: \n` +
      `7. Resolution / Format: \n` +
      `8. Number of Assets: \n` +
      `9. Revisions Needed: \n` +
      `10. One-time or Monthly Ongoing: \n` +
      `11. Special Requirements: \n` +
      `======================================`;
    navigator.clipboard.writeText(templateText);
    playSfx('nav');
    setTemplateCopied(true);
    setTimeout(() => setTemplateCopied(false), 2500);
    registerRealClick('copy_template_quote_modal');
  };

  const handleDiscordClick = () => {
    playSfx('nav');
    registerRealClick(`ask_wolfey_quote_discord_${service?.id || 'general'}`);
    window.open(DISCORD_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-2xl bg-[#0d0f14] border border-cyan-400/40 rounded-2xl shadow-[0_15px_45px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.15)] text-left flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-stone-900/40 to-black/60 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/20"
              style={{ backgroundColor: service ? `${service.accentColor}25` : 'rgba(6,182,212,0.2)' }}
            >
              {service ? service.icon : '💬'}
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold flex items-center gap-1.5">
                <MessageSquare size={11} />
                <span>CUSTOM PROJECT QUOTE // 見積もり</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                {service ? `Custom Quote: ${service.title}` : 'Custom Project Quote'}
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-stone-300 custom-scrollbar">
          {/* Main prompt banner */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-400/25 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold font-mono text-xs uppercase tracking-wider">
              <HelpCircle size={15} />
              <span>Not sure how much your project will cost?</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
              Send the details to Wolfey and get a custom quote tailored to your exact scope, deadline, and creative vision. Every project is unique, so pricing adapts to your scale.
            </p>
          </div>

          {/* Transparent Notice */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
            <strong className="font-semibold text-amber-300">CUSTOM QUOTE REQUIRED:</strong> Final price will be confirmed after reviewing your project requirements. The website does not pretend to compute an arbitrary fixed price before understanding your exact needs.
          </div>

          {/* Details to share */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-mono font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={14} className="text-sky-400" />
                <span>DETAILS TO SHARE WITH WOLFEY</span>
              </h4>
              <button
                onClick={handleCopyTemplate}
                className="text-[11px] font-mono flex items-center gap-1 text-cyan-300 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/25 px-2 py-1 rounded border border-cyan-400/30 transition-colors cursor-pointer"
              >
                {templateCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{templateCopied ? 'Template Copied!' : 'Copy Inquiry Template'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-black/40 border border-white/10">
              {quoteQuestions.map((q, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-stone-300">
                  <span className="font-mono text-cyan-400 font-semibold text-[11px] shrink-0">
                    •
                  </span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>

          {/* DISCORD CALLOUT */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#5865F2]/20 via-black/40 to-cyan-900/20 border border-[#5865F2]/40">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">💬</span>
                <span className="font-mono font-bold text-white text-xs uppercase tracking-wider">
                  SEND DETAILS ON DISCORD
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-stone-300 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                  Discord: <strong className="text-sky-300 font-bold">{DISCORD_USERNAME}</strong>
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
              "Not sure about the price? That's completely fine. Send your project details on Discord and Wolfey will review the requirements and provide a suitable custom quote."
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleDiscordClick}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-mono font-bold text-xs tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(88,101,242,0.4)] cursor-pointer"
              >
                <Send size={14} />
                <span>💬 ASK WOLFEY FOR PRICE</span>
                <ExternalLink size={12} className="opacity-70" />
              </button>

              {onSwitchToBooking && service && (
                <button
                  onClick={() => {
                    playSfx('nav');
                    onSwitchToBooking();
                  }}
                  className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white font-mono text-xs transition-colors cursor-pointer"
                >
                  View Standard Booking
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-black/50 flex items-center justify-between text-xs text-stone-400 shrink-0">
          <span className="font-mono text-[11px]">Direct Discord chat • Realistic scoping</span>
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

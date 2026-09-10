import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { registerRealClick } from '../../lib/firebase';

interface DiscordWidgetProps {
  avatarUrl: string;
  decorationUrl?: string;
  username: string;
}

export const DiscordWidget: React.FC<DiscordWidgetProps> = ({
  avatarUrl,
  decorationUrl,
  username = 'dev_arie',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyUsername = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(username);
    setCopied(true);
    registerRealClick('discord_copy_username');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenDiscord = () => {
    registerRealClick('discord_open_profile');
    window.open('https://discord.com/users/874238077546168320', '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="discord-presence-widget"
      onClick={handleOpenDiscord}
      className="group w-full rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3.5 bg-black/30 border border-white/10 backdrop-blur-md transition-all duration-300 hover:border-[#5865F2]/50 hover:bg-[#5865F2]/10 cursor-pointer text-left"
      style={{
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
      }}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Discord Avatar with Decoration */}
        <div className="relative w-12 h-12 flex-shrink-0">
          <img
            src={avatarUrl}
            alt={username}
            className="w-12 h-12 rounded-full object-cover select-none"
          />
          {decorationUrl && (
            <img
              src={decorationUrl}
              alt="Discord decoration"
              className="absolute -top-1.5 -left-1.5 w-[60px] h-[60px] pointer-events-none select-none max-w-none"
            />
          )}
          {/* Online Status Dot */}
          <span
            title="Online & Ready"
            className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#181824] rounded-full"
          />
        </div>

        {/* Info & Activity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-white truncate">
              {username}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-[#5865F2]/20 text-[#a2b0ff] border border-[#5865F2]/40">
              Discord
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-stone-300 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-medium">Active</span>
            <span className="text-white font-normal truncate">Unreal Engine 5 & DaVinci</span>
          </div>
          <div className="text-[11px] text-stone-400 truncate">
            Game Design • Video Edits • 3D Work
          </div>
        </div>
      </div>

      {/* Copy / Action Button */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={handleCopyUsername}
          title="Copy Discord username"
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white transition-colors border border-white/10 cursor-pointer"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
        <div className="p-2 rounded-lg bg-[#5865F2]/20 text-[#a2b0ff] border border-[#5865F2]/30 group-hover:bg-[#5865F2] group-hover:text-white transition-colors">
          <ExternalLink size={14} />
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Radio,
  ExternalLink,
  Disc3,
  Flame,
  Headphones,
} from 'lucide-react';
import { WOLFEY_MUSIC_TRACKS, MusicTrack } from '../../data/musicTracks';
import { playSfx } from '../../lib/soundManager';
import { registerRealClick } from '../../lib/firebase';
import { AnimatedScrollContainer } from '../AnimatedScrollContainer';

export const MusicTab: React.FC = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Synchronize state with background audio player
  useEffect(() => {
    const handleState = (e: Event) => {
      const custom = e as CustomEvent<{
        currentTrackIndex: number;
        isPlaying: boolean;
      }>;
      if (custom.detail) {
        if (typeof custom.detail.currentTrackIndex === 'number') {
          setCurrentTrackIndex(custom.detail.currentTrackIndex);
        }
        if (typeof custom.detail.isPlaying === 'boolean') {
          setIsPlaying(custom.detail.isPlaying);
        }
      }
    };

    window.addEventListener('wolfey_music_state', handleState);
    return () => window.removeEventListener('wolfey_music_state', handleState);
  }, []);

  const handleSelectTrack = (index: number) => {
    playSfx('music-next');
    window.dispatchEvent(new CustomEvent('wolfey_select_track', { detail: { index } }));
    registerRealClick(`music_tab_select_track_${index + 1}`);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      playSfx('music-pause');
    } else {
      playSfx('music-play');
    }
    window.dispatchEvent(new CustomEvent('wolfey_toggle_play'));
  };

  const activeTrack: MusicTrack =
    WOLFEY_MUSIC_TRACKS[currentTrackIndex] || WOLFEY_MUSIC_TRACKS[0];

  return (
    <AnimatedScrollContainer maxHeightClass="max-h-[540px] sm:max-h-[600px]">
      <div id="music-tab-content" className="flex flex-col gap-4 text-left py-1">
        {/* Header Hero Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1b1028]/90 via-[#0e0a1a]/85 to-[#0b1329]/90 border border-purple-500/40 shadow-xl flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider font-mono">
              <Disc3 size={16} className={`text-purple-400 ${isPlaying ? 'animate-spin' : ''}`} />
              <span>Anime Sound Lounge // 音楽システム</span>
            </div>
            <span className="text-[10px] font-mono text-purple-200 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-400/30">
              10 Curated Official Tracks
            </span>
          </div>

          {/* Current Active Track Display */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-black/60 border border-purple-400/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/25">
                <Music size={22} className="text-white" />
                {isPlaying && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider block">
                  NOW STREAMING • TRACK #{activeTrack.index}
                </span>
                <h3 className="text-sm sm:text-base font-black text-white truncate font-['Plus_Jakarta_Sans']">
                  {activeTrack.title}
                </h3>
                <span className="text-xs text-stone-400 truncate block">
                  {activeTrack.artist}
                </span>
              </div>
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={handleTogglePlay}
              className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-md shadow-purple-500/30 transition-transform active:scale-95 cursor-pointer flex-shrink-0"
              title={isPlaying ? 'Pause Music' : 'Play Music'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
            </button>
          </div>
        </div>

        {/* Tracklist of ONLY the 10 User-Specified Songs */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
              <Headphones size={13} className="text-purple-400" />
              Website Official Tracklist (Only 10 Tracks)
            </span>
            <span className="text-[10px] font-mono text-stone-500">
              Select any track to stream
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {WOLFEY_MUSIC_TRACKS.map((track, idx) => {
              const isActive = idx === currentTrackIndex;
              return (
                <motion.div
                  key={track.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleSelectTrack(idx)}
                  className={`p-3 sm:p-3.5 rounded-xl border backdrop-blur-md cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-purple-950/40 border-purple-400/60 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                      : 'bg-black/40 border-white/10 hover:border-purple-400/30 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-6 text-center font-mono font-bold text-xs ${
                        isActive ? 'text-purple-300' : 'text-stone-500'
                      }`}
                    >
                      {String(track.index).padStart(2, '0')}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-xs sm:text-sm font-bold truncate ${
                            isActive ? 'text-white' : 'text-stone-200'
                          }`}
                        >
                          {track.title}
                        </h4>
                        {isActive && isPlaying && (
                          <div className="flex items-center gap-0.5">
                            <span className="w-1 h-3 bg-pink-400 rounded-full animate-bounce" />
                            <span className="w-1 h-4 bg-purple-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                            <span className="w-1 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-400 block truncate">
                        {track.artist}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={track.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
                      title="Open on YouTube"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </AnimatedScrollContainer>
  );
};

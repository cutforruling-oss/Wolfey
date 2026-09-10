import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Music,
  ChevronLeft,
  ChevronRight,
  ListMusic,
  Disc,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WOLFEY_MUSIC_TRACKS, MusicTrack } from '../data/musicTracks';
import { playSfx } from '../lib/soundManager';
import { registerRealClick } from '../lib/firebase';

interface WolfeyMusicPlayerProps {
  isEntered: boolean;
}

export const WolfeyMusicPlayer: React.FC<WolfeyMusicPlayerProps> = ({ isEntered }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0); // Starts at Song #1
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('wolfey_music_muted') === 'true';
    } catch {
      return false;
    }
  });
  const [volume, setVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('wolfey_music_volume');
      return saved !== null ? parseFloat(saved) : 0.65;
    } catch {
      return 0.65;
    }
  });
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [showTracklist, setShowTracklist] = useState<boolean>(false);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);

  // References to audio elements
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const ytIframeRef = useRef<HTMLIFrameElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const currentTrack: MusicTrack = WOLFEY_MUSIC_TRACKS[currentTrackIndex] || WOLFEY_MUSIC_TRACKS[0];
  const isLocalTrack = currentTrackIndex === 0; // Song #1 has high-fidelity local audio fallback

  // Keep track of current index & state for event listeners without stale closures
  const currentTrackIndexRef = useRef<number>(currentTrackIndex);
  useEffect(() => {
    currentTrackIndexRef.current = currentTrackIndex;
  }, [currentTrackIndex]);

  const lastEndedTrackRef = useRef<number | null>(null);
  const handleSongEndedRef = useRef<() => void>(() => {});

  // Send command to YouTube iframe safely via postMessage
  const postYtCommand = useCallback((func: string, args: any[] = []) => {
    try {
      if (ytIframeRef.current && ytIframeRef.current.contentWindow) {
        ytIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      }
    } catch {
      // Ignore cross-origin postMessage restrictions in sandboxed iframe
    }
  }, []);

  // Listen for YouTube postMessage events for duration & time updates
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        // STRICT ISOLATION: Only accept messages from OUR music iframe!
        // BackgroundVideo or other iframes must NEVER bleed into WolfeyMusicPlayer!
        if (
          !ytIframeRef.current ||
          !ytIframeRef.current.contentWindow ||
          event.source !== ytIframeRef.current.contentWindow
        ) {
          return;
        }

        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data);
          if (data.event === 'infoDelivery' && data.info) {
            if (typeof data.info.currentTime === 'number' && !isScrubbing) {
              setCurrentTime(data.info.currentTime);
            }
            if (typeof data.info.duration === 'number' && data.info.duration > 0) {
              setDuration(data.info.duration);
            }
            if (data.info.playerState === 1) {
              setIsPlaying(true);
              // Ensure volume is enforced whenever track starts playing
              if (!isLocalTrack) {
                const volPercent = isMuted ? 0 : Math.round(volume * 100);
                postYtCommand('setVolume', [volPercent]);
                if (isMuted || volPercent === 0) {
                  postYtCommand('mute');
                } else {
                  postYtCommand('unMute');
                }
              }
            } else if (data.info.playerState === 2) {
              setIsPlaying(false);
            } else if (data.info.playerState === 0) {
              // YouTube track finished playing (playerState === 0 is ENDED)
              // Automatically transition to next sequential track: 1 -> 2 -> ... -> 10 -> 1
              handleSongEndedRef.current();
            }
          }
        }
      } catch {
        // Ignore non-JSON postMessages from other extensions/services
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isScrubbing, isLocalTrack, isMuted, volume, postYtCommand]);

  // Synchronize volume and mute states with strict mutual exclusion:
  // Song #1 ONLY plays on localAudioRef. Songs #2-#10 ONLY play on ytIframeRef.
  useEffect(() => {
    if (isLocalTrack) {
      // Song #1 (Local Audio primary)
      if (localAudioRef.current) {
        localAudioRef.current.volume = isMuted ? 0 : volume;
        localAudioRef.current.muted = isMuted;
      }
      // Ensure YouTube iframe is completely silent & paused
      postYtCommand('pauseVideo');
      postYtCommand('mute');
      postYtCommand('setVolume', [0]);
    } else {
      // Songs #2 - #10 (YouTube Audio)
      if (localAudioRef.current) {
        localAudioRef.current.pause();
        localAudioRef.current.volume = 0;
        localAudioRef.current.muted = true;
      }
      const volPercent = isMuted ? 0 : Math.round(volume * 100);
      postYtCommand('setVolume', [volPercent]);
      if (isMuted || volPercent === 0) {
        postYtCommand('mute');
      } else {
        postYtCommand('unMute');
      }
    }
  }, [volume, isMuted, isLocalTrack, postYtCommand]);

  // Broadcast current player state to window so MusicTab remains 100% in sync
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('wolfey_music_state', {
        detail: { currentTrackIndex, isPlaying, volume, isMuted },
      })
    );
  }, [currentTrackIndex, isPlaying, volume, isMuted]);

  const hasAutoStartedRef = useRef<boolean>(false);

  // When visitor clicks to enter on Front Page, automatically start Song #1 (ONCE ONLY)
  useEffect(() => {
    if (isEntered && !hasAutoStartedRef.current) {
      hasAutoStartedRef.current = true;
      setIsPlaying(true);
      if (localAudioRef.current) {
        localAudioRef.current.currentTime = 0;
        localAudioRef.current.volume = isMuted ? 0 : volume;
        localAudioRef.current.muted = isMuted;
        localAudioRef.current.play().catch((err) => {
          console.warn('Initial local audio playback waiting for user gesture:', err);
        });
      }
      // Guarantee YouTube engine remains paused and muted
      postYtCommand('pauseVideo');
      postYtCommand('mute');
      postYtCommand('setVolume', [0]);
    }
  }, [isEntered, isMuted, volume, postYtCommand]);

  // Progress polling for local audio or timer estimation
  useEffect(() => {
    if (isPlaying && isLocalTrack) {
      progressIntervalRef.current = window.setInterval(() => {
        if (localAudioRef.current && !isScrubbing) {
          setCurrentTime(localAudioRef.current.currentTime);
          if (localAudioRef.current.duration && !isNaN(localAudioRef.current.duration)) {
            setDuration(localAudioRef.current.duration);
          }
        }
      }, 250);
    } else if (!isLocalTrack) {
      // When playing YouTube, request info updates
      progressIntervalRef.current = window.setInterval(() => {
        postYtCommand('listening');
      }, 500);
    } else {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, isLocalTrack, isScrubbing, postYtCommand]);

  // Play / Pause toggle with strict mutual exclusion
  const handleTogglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isPlaying) {
      playSfx('music-pause');
      setIsPlaying(false);
      if (isLocalTrack && localAudioRef.current) {
        localAudioRef.current.pause();
      } else {
        postYtCommand('pauseVideo');
      }
    } else {
      playSfx('music-play');
      setIsPlaying(true);
      if (isLocalTrack) {
        if (localAudioRef.current) {
          localAudioRef.current.volume = isMuted ? 0 : volume;
          localAudioRef.current.muted = isMuted;
          localAudioRef.current.play().catch(() => {});
        }
        // Strict guard: ensure YouTube is paused and silent
        postYtCommand('pauseVideo');
        postYtCommand('mute');
        postYtCommand('setVolume', [0]);
      } else {
        if (localAudioRef.current) {
          localAudioRef.current.pause();
          localAudioRef.current.volume = 0;
          localAudioRef.current.muted = true;
        }
        const volPercent = isMuted ? 0 : Math.round(volume * 100);
        postYtCommand('setVolume', [volPercent]);
        if (!isMuted && volPercent > 0) {
          postYtCommand('unMute');
        }
        postYtCommand('playVideo');
      }
    }
    registerRealClick('music_toggle_play');
  };

  // Change Track helper
  const changeTrack = useCallback(
    (newIndex: number, soundType: 'music-next' | 'music-prev' = 'music-next') => {
      playSfx(soundType);
      lastEndedTrackRef.current = null; // Clear so next track can trigger ended when complete
      setCurrentTrackIndex(newIndex);
      currentTrackIndexRef.current = newIndex;
      setCurrentTime(0);
      setIsPlaying(true);

      const targetTrack = WOLFEY_MUSIC_TRACKS[newIndex];

      if (newIndex === 0) {
        // Song #1 (Local Audio primary - YouTube strictly paused & muted)
        postYtCommand('pauseVideo');
        postYtCommand('mute');
        postYtCommand('setVolume', [0]);
        if (localAudioRef.current) {
          localAudioRef.current.currentTime = 0;
          localAudioRef.current.volume = isMuted ? 0 : volume;
          localAudioRef.current.muted = isMuted;
          localAudioRef.current.play().catch(() => {});
        }
      } else {
        // Songs 2 - 10 (YouTube Stream - local audio strictly paused & muted)
        if (localAudioRef.current) {
          localAudioRef.current.pause();
          localAudioRef.current.currentTime = 0;
          localAudioRef.current.volume = 0;
          localAudioRef.current.muted = true;
        }
        const volPercent = isMuted ? 0 : Math.round(volume * 100);
        postYtCommand('loadVideoById', [targetTrack.id]);
        postYtCommand('playVideo');
        // Re-enforce volume after YouTube player initializes the new video
        setTimeout(() => {
          postYtCommand('setVolume', [volPercent]);
          if (isMuted || volPercent === 0) {
            postYtCommand('mute');
          } else {
            postYtCommand('unMute');
          }
        }, 150);
        setTimeout(() => {
          postYtCommand('setVolume', [volPercent]);
        }, 600);
      }

      registerRealClick(`music_change_track_${newIndex + 1}`);
    },
    [isMuted, volume, postYtCommand]
  );

  // Auto-next sequential playback when current track finishes:
  // Song #1 -> #2 -> #3 -> #4 -> #5 -> #6 -> #7 -> #8 -> #9 -> #10 -> #1 (seamless loop)
  const handleSongEnded = useCallback(() => {
    const currentIndex = currentTrackIndexRef.current;
    if (lastEndedTrackRef.current === currentIndex) return;
    lastEndedTrackRef.current = currentIndex;

    const nextIdx = (currentIndex + 1) % WOLFEY_MUSIC_TRACKS.length;
    changeTrack(nextIdx, 'music-next');
  }, [changeTrack]);

  useEffect(() => {
    handleSongEndedRef.current = handleSongEnded;
  }, [handleSongEnded]);

  // Next Track: 1 -> 2 -> ... -> 10 -> 1
  const handleNextSong = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextIdx = (currentTrackIndex + 1) % WOLFEY_MUSIC_TRACKS.length;
    changeTrack(nextIdx, 'music-next');
  };

  // Previous Track: 10 -> 9 -> ... -> 1 -> 10
  const handlePrevSong = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const prevIdx =
      (currentTrackIndex - 1 + WOLFEY_MUSIC_TRACKS.length) % WOLFEY_MUSIC_TRACKS.length;
    changeTrack(prevIdx, 'music-prev');
  };

  // Direct select from tracklist
  const handleSelectTrack = (index: number) => {
    changeTrack(index, 'music-next');
    setShowTracklist(false);
  };

  // External event integration with MusicTab
  useEffect(() => {
    const handleSelect = (e: Event) => {
      const customEvent = e as CustomEvent<{ index: number }>;
      if (customEvent.detail && typeof customEvent.detail.index === 'number') {
        changeTrack(customEvent.detail.index, 'music-next');
      }
    };
    const handleToggle = () => {
      handleTogglePlay();
    };

    window.addEventListener('wolfey_select_track', handleSelect);
    window.addEventListener('wolfey_toggle_play', handleToggle);

    return () => {
      window.removeEventListener('wolfey_select_track', handleSelect);
      window.removeEventListener('wolfey_toggle_play', handleToggle);
    };
  }, [changeTrack, handleTogglePlay]);

  // Volume slider
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    try {
      localStorage.setItem('wolfey_music_volume', val.toString());
    } catch {}

    // Instant volume synchronization to hardware audio engine
    if (isLocalTrack) {
      if (localAudioRef.current) {
        localAudioRef.current.volume = isMuted ? 0 : val;
      }
    } else {
      const volPercent = isMuted ? 0 : Math.round(val * 100);
      postYtCommand('setVolume', [volPercent]);
    }

    if (val > 0 && isMuted) {
      setIsMuted(false);
      try {
        localStorage.setItem('wolfey_music_muted', 'false');
      } catch {}
      if (isLocalTrack) {
        if (localAudioRef.current) {
          localAudioRef.current.muted = false;
          localAudioRef.current.volume = val;
        }
      } else {
        postYtCommand('unMute');
      }
    }
  };

  // Mute / Unmute
  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    try {
      localStorage.setItem('wolfey_music_muted', nextMuted.toString());
    } catch {}

    if (isLocalTrack) {
      if (localAudioRef.current) {
        localAudioRef.current.muted = nextMuted;
        localAudioRef.current.volume = nextMuted ? 0 : volume;
      }
    } else {
      if (nextMuted) {
        postYtCommand('mute');
        postYtCommand('setVolume', [0]);
      } else {
        const volPercent = Math.round(volume * 100);
        postYtCommand('unMute');
        postYtCommand('setVolume', [volPercent]);
      }
    }

    if (nextMuted) {
      playSfx('mute');
    } else {
      playSfx('unmute');
    }
    registerRealClick('music_toggle_mute');
  };

  // Scrubber seeking
  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetSec = parseFloat(e.target.value);
    setCurrentTime(targetSec);
  };

  const handleScrubberStart = () => {
    setIsScrubbing(true);
  };

  const handleScrubberEnd = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    setIsScrubbing(false);
    const targetSec = parseFloat((e.target as HTMLInputElement).value);
    if (isLocalTrack) {
      if (localAudioRef.current) {
        localAudioRef.current.currentTime = targetSec;
      }
    } else {
      postYtCommand('seekTo', [targetSec, true]);
    }
  };

  // Hide / Show toggling with unique anime sound
  const handleTogglePanel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPanelVisible) {
      playSfx('hide');
    } else {
      playSfx('show');
    }
    setIsPanelVisible((prev) => !prev);
    registerRealClick(`music_panel_${isPanelVisible ? 'hide' : 'show'}`);
  };

  // Mobile Swipe Left / Right to change songs
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const touch = e.changedTouches[0];
    const diffX = touch.clientX - touchStartXRef.current;
    const diffY = touch.clientY - touchStartYRef.current;

    // Detect horizontal swipe with threshold
    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY) * 1.4) {
      if (diffX < 0) {
        handleNextSong();
      } else {
        handlePrevSong();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Helper formatting for seconds to mm:ss
  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentPercent = isMuted ? 0 : Math.round(volume * 100);

  return (
    <>
      {/* 
        PERMANENT AUDIO PLAYBACK ENGINE (Always mounted, zero React reconciliation churn):
        1. Local HTML5 Audio for instantaneous, zero-latency playback of Song #1
        2. Hidden YouTube iframe for Songs 2 through 10
      */}
      <audio
        ref={localAudioRef}
        src="/assets/audio/music.mp3"
        preload="auto"
        onEnded={() => {
          handleSongEndedRef.current();
        }}
        className="hidden pointer-events-none"
      />

      <iframe
        ref={ytIframeRef}
        id="wolfey-yt-music-engine"
        className="fixed -top-[9999px] -left-[9999px] w-1 h-1 opacity-0 pointer-events-none"
        src="https://www.youtube-nocookie.com/embed/?enablejsapi=1&controls=0&disablekb=1&fs=0&playsinline=1&rel=0&mute=1"
        allow="autoplay; encrypted-media"
        title="Wolfey Music Engine"
        onLoad={() => {
          // Keep strictly paused and silent until a YouTube track (Songs 2-10) is chosen
          postYtCommand('pauseVideo');
          postYtCommand('mute');
          postYtCommand('setVolume', [0]);
        }}
      />

      {/* 
        STRICT RULE: Front page (isEntered === false) has NO VISIBLE MUSIC CONTROLS!
        Controls only appear after clicking to enter.
      */}
      {isEntered && (
        <div
          id="wolfey-music-controller-wrapper"
          className="fixed top-4 left-4 z-40 flex flex-col select-none pointer-events-auto"
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            {isPanelVisible ? (
              /* ==========================================================
                 EXPANDED 3D ANIME GAMING MUSIC PLAYER PANEL
                 ========================================================== */
              <motion.div
                key="full-music-panel"
                initial={{ opacity: 0, x: -25, scale: 0.9, rotateY: 15 }}
                animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, x: -25, scale: 0.9, rotateY: 15 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col gap-2 p-3 sm:p-3.5 rounded-2xl bg-[#0b0c1b]/90 border border-sky-400/35 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.75),0_0_25px_rgba(56,189,248,0.2)] max-w-[320px] sm:max-w-[370px]"
                style={{
                  perspective: '1000px',
                }}
              >
                {/* Futuristic Cyber Corner Accents */}
                <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-pink-400 pointer-events-none" />
                <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-sky-400 pointer-events-none" />
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-purple-400 pointer-events-none" />

                {/* Header Row: Track Number, Badge, and Hide Button */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Glowing Track Index Indicator */}
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/20 border border-sky-400/40 text-[10px] font-mono font-bold text-sky-300 tracking-wider">
                      <Disc size={11} className={isPlaying ? 'animate-spin' : ''} />
                      SONG {currentTrack.index} / {WOLFEY_MUSIC_TRACKS.length}
                    </span>

                    {/* Visualizer / Frequency Bars */}
                    <div className="flex items-end gap-[2px] h-3.5 px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
                      <span
                        className={`w-[2px] bg-cyan-400 rounded-full transition-all duration-200 ${
                          isPlaying ? 'h-3 animate-[bounce_0.6s_ease-in-out_infinite]' : 'h-1'
                        }`}
                      />
                      <span
                        className={`w-[2px] bg-pink-400 rounded-full transition-all duration-200 ${
                          isPlaying ? 'h-3.5 animate-[bounce_0.8s_ease-in-out_infinite_0.15s]' : 'h-1.5'
                        }`}
                      />
                      <span
                        className={`w-[2px] bg-sky-300 rounded-full transition-all duration-200 ${
                          isPlaying ? 'h-2 animate-[bounce_0.7s_ease-in-out_infinite_0.3s]' : 'h-1'
                        }`}
                      />
                      <span
                        className={`w-[2px] bg-purple-400 rounded-full transition-all duration-200 ${
                          isPlaying ? 'h-3 animate-[bounce_0.75s_ease-in-out_infinite_0.1s]' : 'h-1'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Tracklist Toggle & Hide Button */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        playSfx('nav');
                        setShowTracklist((p) => !p);
                      }}
                      className={`cursor-pointer p-1.5 rounded-lg transition-all text-xs flex items-center gap-1 ${
                        showTracklist
                          ? 'bg-sky-400/25 text-sky-300 border border-sky-400/50'
                          : 'bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-white/5'
                      }`}
                      title="View All 10 Songs"
                    >
                      <ListMusic size={13} />
                    </button>

                    {/* Hide Music Button */}
                    <button
                      onClick={handleTogglePanel}
                      className="cursor-pointer p-1.5 rounded-lg bg-white/5 hover:bg-pink-500/20 text-stone-300 hover:text-pink-300 transition-all border border-white/5 hover:border-pink-400/40 flex items-center justify-center group"
                      title="Hide Music Player (Music keeps playing)"
                    >
                      <ChevronLeft
                        size={14}
                        className="transition-transform group-hover:-translate-x-0.5"
                      />
                    </button>
                  </div>
                </div>

                {/* Track Info (Title & Artist) */}
                <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-black/40 border border-white/10 overflow-hidden">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/15 bg-stone-900 flex items-center justify-center">
                    <img
                      src={currentTrack.coverImage}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <Music size={14} className="absolute text-sky-300 pointer-events-none" />
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold text-white truncate tracking-wide font-['Plus_Jakarta_Sans']">
                      {currentTrack.title}
                    </span>
                    <span className="text-[10px] text-stone-400 truncate font-mono">
                      {currentTrack.artist}
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Timers */}
                <div className="flex flex-col gap-1 px-1">
                  <div className="relative flex items-center">
                    <input
                      type="range"
                      min="0"
                      max={duration > 0 ? duration : 100}
                      step="0.5"
                      value={currentTime}
                      onChange={handleScrubberChange}
                      onMouseDown={handleScrubberStart}
                      onTouchStart={handleScrubberStart}
                      onMouseUp={handleScrubberEnd}
                      onTouchEnd={handleScrubberEnd}
                      className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-sky-400"
                      aria-label="Track progress"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 px-0.5">
                    <span>{formatTime(currentTime)}</span>
                    <span className="text-sky-300/80">{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Main Playback & Navigation Controls */}
                <div className="flex items-center justify-between gap-1.5 pt-0.5">
                  {/* Previous Button (Song 1 -> Song 10) */}
                  <button
                    onClick={handlePrevSong}
                    className="cursor-pointer p-2 rounded-xl bg-white/5 hover:bg-sky-400/20 text-stone-200 hover:text-sky-300 transition-all active:scale-95 border border-white/5 hover:border-sky-400/40 flex items-center justify-center"
                    title="◀ Previous Song (Loops 1 → 10)"
                    aria-label="Previous Song"
                  >
                    <SkipBack size={15} />
                  </button>

                  {/* Play / Pause Button */}
                  <button
                    onClick={handleTogglePlay}
                    className="cursor-pointer px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-bold transition-all active:scale-95 shadow-[0_0_15px_rgba(56,189,248,0.5)] flex items-center justify-center gap-1.5 text-xs font-mono"
                    title={isPlaying ? 'Pause Music' : 'Play Music'}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <>
                        <Pause size={14} className="fill-slate-950" />
                        <span>PAUSE</span>
                      </>
                    ) : (
                      <>
                        <Play size={14} className="fill-slate-950" />
                        <span>PLAY</span>
                      </>
                    )}
                  </button>

                  {/* Next Button (Song 10 -> Song 1) */}
                  <button
                    onClick={handleNextSong}
                    className="cursor-pointer p-2 rounded-xl bg-white/5 hover:bg-sky-400/20 text-stone-200 hover:text-sky-300 transition-all active:scale-95 border border-white/5 hover:border-sky-400/40 flex items-center justify-center"
                    title="Next Song ▶ (Loops 10 → 1)"
                    aria-label="Next Song"
                  >
                    <SkipForward size={15} />
                  </button>

                  {/* Vertical Divider */}
                  <div className="h-5 w-[1px] bg-white/10 mx-0.5" />

                  {/* Mute/Unmute */}
                  <button
                    onClick={handleToggleMute}
                    className="cursor-pointer p-2 rounded-xl bg-white/5 hover:bg-sky-400/20 text-stone-300 hover:text-sky-300 transition-all active:scale-95 border border-white/5 hover:border-sky-400/40"
                    title={isMuted ? 'Unmute' : 'Mute'}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX size={15} className="text-red-400" />
                    ) : volume < 0.5 ? (
                      <Volume1 size={15} className="text-sky-200" />
                    ) : (
                      <Volume2 size={15} className="text-sky-300" />
                    )}
                  </button>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-1.5 pl-0.5">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-14 sm:w-16 h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-sky-400"
                      aria-label="Volume slider"
                    />
                    <span className="text-[10px] font-mono text-stone-300 min-w-[24px]">
                      {currentPercent}%
                    </span>
                  </div>
                </div>

                {/* Mobile Swipe Guidance Tag */}
                <div className="text-[9px] font-mono text-stone-400/80 text-center flex items-center justify-center gap-1 pt-0.5">
                  <span>◀ Swipe Left / Right to Change Songs ▶</span>
                </div>

                {/* Dropdown Tracklist Drawer (All 10 Songs) */}
                <AnimatePresence>
                  {showTracklist && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden flex flex-col gap-1 pt-2 border-t border-white/10"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 px-1">
                        <span>SELECT FROM 10 TRACKS</span>
                        <span className="text-sky-400">Wolfey Audio</span>
                      </div>

                      <div className="max-h-48 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
                        {WOLFEY_MUSIC_TRACKS.map((track, idx) => {
                          const isCurrent = idx === currentTrackIndex;
                          return (
                            <button
                              key={track.id}
                              onClick={() => handleSelectTrack(idx)}
                              className={`cursor-pointer flex items-center gap-2 p-1.5 rounded-lg text-left transition-all font-mono text-[11px] ${
                                isCurrent
                                  ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50'
                                  : 'bg-black/30 hover:bg-white/5 text-stone-300 border border-transparent'
                              }`}
                            >
                              <span className="w-4 text-center font-bold text-[10px] text-sky-400">
                                {idx + 1}
                              </span>
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="truncate text-white font-medium">{track.title}</span>
                                <span className="truncate text-[9px] text-stone-400">{track.artist}</span>
                              </div>
                              {isCurrent && isPlaying && (
                                <Disc size={11} className="text-sky-400 shrink-0 animate-spin" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* ==========================================================
                 COMPACT FLOATING ANIME MUSIC ORB / BUTTON (WHEN HIDDEN)
                 ========================================================== */
              <motion.button
                key="minimized-music-orb"
                initial={{ opacity: 0, scale: 0.8, x: -15 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -15 }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleTogglePanel}
                className="cursor-pointer group relative flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#0b0c1b]/95 border border-sky-400/40 backdrop-blur-xl font-mono text-xs shadow-[0_6px_25px_rgba(0,0,0,0.6),0_0_18px_rgba(56,189,248,0.3)] transition-all pointer-events-auto"
                title="Show Full Music Player (Music is playing uninterrupted)"
                aria-label="Show Music Player"
              >
                {/* Spinning Disc / Glowing Music Note */}
                <div className="relative flex items-center justify-center">
                  <Music
                    size={15}
                    className={`text-sky-300 transition-colors group-hover:text-cyan-200 ${
                      isPlaying ? 'animate-pulse' : 'text-stone-400'
                    }`}
                  />
                  {isPlaying && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>

                {/* Small Equalizer */}
                <div className="flex items-end gap-[2px] h-3 w-3">
                  <span
                    className={`w-[2px] bg-cyan-400 rounded-full transition-all ${
                      isPlaying ? 'h-3 animate-[bounce_0.6s_ease-in-out_infinite]' : 'h-1'
                    }`}
                  />
                  <span
                    className={`w-[2px] bg-pink-400 rounded-full transition-all ${
                      isPlaying ? 'h-2.5 animate-[bounce_0.8s_ease-in-out_infinite_0.15s]' : 'h-1'
                    }`}
                  />
                </div>

                {/* Track Badge & Percent */}
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-200 group-hover:text-white">
                  <span className="text-sky-300 font-bold">#{currentTrack.index}</span>
                  <span className="hidden sm:inline truncate max-w-[85px] text-stone-300">
                    {currentTrack.title}
                  </span>
                  <span className="text-stone-400 text-[10px]">({currentPercent}%)</span>
                </div>

                <ChevronRight
                  size={13}
                  className="text-stone-400 group-hover:text-sky-300 transition-transform group-hover:translate-x-0.5"
                />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
};

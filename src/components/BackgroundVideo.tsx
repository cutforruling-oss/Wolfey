import React, { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useBackground } from '../context/BackgroundContext';
import { getCurrentSettings, subscribePerformance } from '../lib/performanceManager';

interface BackgroundVideoProps {
  isEntered: boolean;
  onOpenBackgroundTab?: () => void;
}

export const BackgroundVideo: React.FC<BackgroundVideoProps> = ({
  isEntered,
}) => {
  const {
    currentVideo,
    incomingVideo,
    isTransitioning,
    isIncomingReady,
    setIsIncomingReady,
    finalizeTransition,
    nextBg,
    prevBg,
  } = useBackground();

  const activeIframeRef = useRef<HTMLIFrameElement | null>(null);
  const incomingIframeRef = useRef<HTMLIFrameElement | null>(null);
  const perfSettingsRef = useRef(getCurrentSettings());

  useEffect(() => {
    return subscribePerformance((_, settings) => {
      perfSettingsRef.current = settings;
    });
  }, []);

  // PostMessage command sender for guaranteed mute and playback
  const sendIframeCommand = useCallback((iframe: HTMLIFrameElement | null, func: string, args: unknown[] = []) => {
    if (!iframe || !iframe.contentWindow) return;
    try {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    } catch {
      // Cross-origin safe ignore
    }
  }, []);

  // Guarantee 100% silence: absolutely zero sound can ever emit from background video
  const enforceZeroAudio = useCallback((iframe: HTMLIFrameElement | null) => {
    if (!iframe || !iframe.contentWindow) return;
    try {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'mute', args: [] }),
        '*'
      );
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setVolume', args: [0] }),
        '*'
      );
    } catch {}
  }, []);

  // Continuous and multi-stage silence enforcement so video never produces audio
  useEffect(() => {
    enforceZeroAudio(activeIframeRef.current);
    const t1 = setTimeout(() => enforceZeroAudio(activeIframeRef.current), 300);
    const t2 = setTimeout(() => enforceZeroAudio(activeIframeRef.current), 800);
    const t3 = setTimeout(() => enforceZeroAudio(activeIframeRef.current), 1800);
    const t4 = setTimeout(() => enforceZeroAudio(activeIframeRef.current), 3000);

    const interval = setInterval(() => {
      enforceZeroAudio(activeIframeRef.current);
    }, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearInterval(interval);
    };
  }, [currentVideo.id, enforceZeroAudio]);

  // Intercept any YouTube postMessages and enforce mute if state changes
  useEffect(() => {
    const handleYtMessage = (e: MessageEvent) => {
      try {
        if (
          e.source !== activeIframeRef.current?.contentWindow &&
          e.source !== incomingIframeRef.current?.contentWindow
        ) {
          return;
        }

        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data && (data.event === 'infoDelivery' || data.event === 'initialDelivery' || data.event === 'onReady')) {
          if (e.source === activeIframeRef.current?.contentWindow) {
            enforceZeroAudio(activeIframeRef.current);
          } else if (e.source === incomingIframeRef.current?.contentWindow) {
            enforceZeroAudio(incomingIframeRef.current);
          }
        }
      } catch {}
    };

    window.addEventListener('message', handleYtMessage);
    return () => window.removeEventListener('message', handleYtMessage);
  }, [enforceZeroAudio]);

  // Handle incoming iframe loaded
  const handleIncomingIframeLoad = () => {
    setIsIncomingReady(true);
    // Pause previous active video immediately to release GPU resources
    sendIframeCommand(activeIframeRef.current, 'pauseVideo');
    enforceZeroAudio(incomingIframeRef.current);

    setTimeout(() => {
      finalizeTransition();
      enforceZeroAudio(activeIframeRef.current);
    }, 350);
  };

  // Keyboard navigation shortcuts: ArrowLeft/ArrowRight to switch backgrounds
  useEffect(() => {
    if (!isEntered) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextBg();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevBg();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEntered, nextBg, prevBg]);

  // Pause video on tab visibility change to preserve mobile battery & GPU
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        sendIframeCommand(activeIframeRef.current, 'pauseVideo');
      } else {
        sendIframeCommand(activeIframeRef.current, 'playVideo');
        enforceZeroAudio(activeIframeRef.current);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sendIframeCommand, enforceZeroAudio]);

  const qualityParam = perfSettingsRef.current.tier === 'performance' ? '&vq=medium' : '';

  return (
    <div
      id="wolfey-animated-background-system"
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
    >
      {/* 1. ACTIVE VIDEO BUFFER (Current) */}
      <div
        className={`absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none transition-opacity duration-700 ease-in-out ${
          isIncomingReady ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Lightweight Thumbnail Backdrop to eliminate black flashes */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 filter blur-xs"
          style={{
            backgroundImage: `url(https://img.youtube.com/vi/${currentVideo.id}/hqdefault.jpg)`,
          }}
        />

        {/* Active YouTube IFrame: STRICTLY MUTED */}
        <iframe
          ref={activeIframeRef}
          key={`active-${currentVideo.id}`}
          className="w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] object-cover pointer-events-none select-none scale-[1.08]"
          src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${currentVideo.id}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&enablejsapi=1&volume=0${qualityParam}`}
          allow="autoplay"
          title={currentVideo.title}
          loading="eager"
          onLoad={() => {
            enforceZeroAudio(activeIframeRef.current);
          }}
        />
      </div>

      {/* 2. INCOMING VIDEO BUFFER (Preloading next video during switch) */}
      {incomingVideo && (
        <div
          className={`absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none transition-opacity duration-500 ease-in-out ${
            isIncomingReady ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center scale-105 filter blur-xs"
            style={{
              backgroundImage: `url(https://img.youtube.com/vi/${incomingVideo.id}/hqdefault.jpg)`,
            }}
          />

          <iframe
            ref={incomingIframeRef}
            key={`incoming-${incomingVideo.id}`}
            className="w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] object-cover pointer-events-none select-none scale-[1.08]"
            src={`https://www.youtube.com/embed/${incomingVideo.id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${incomingVideo.id}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&enablejsapi=1&volume=0${qualityParam}`}
            allow="autoplay"
            title={incomingVideo.title}
            loading="lazy"
            onLoad={handleIncomingIframeLoad}
          />
        </div>
      )}

      {/* Cinematic Anime Vignette Overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(8, 8, 16, 0.42) 0%, rgba(4, 4, 10, 0.85) 100%)',
          backdropFilter: 'brightness(0.85)',
        }}
      />

      {/* Subtle futuristic scanline & grid texture */}
      <div
        className="absolute inset-0 z-10 pointer-events-none opacity-15"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Cinematic Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{
              opacity: [0, 0.95, 0],
              scale: [1, 1.08, 1],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-25 pointer-events-none flex items-center justify-center overflow-hidden backdrop-blur-xs"
            style={{
              background:
                'radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, rgba(147, 51, 234, 0.2) 50%, rgba(0, 0, 0, 0.7) 100%)',
            }}
          >
            <div className="w-56 h-56 rounded-full border-2 border-cyan-400/80 shadow-[0_0_60px_#38bdf8] animate-ping" />
            <span className="absolute font-mono text-xs text-sky-200 tracking-[0.3em] uppercase font-bold px-4 py-2 rounded-full bg-black/60 border border-sky-400/40 backdrop-blur-md shadow-[0_0_20px_rgba(56,189,248,0.4)]">
              ✦ SWITCHING SCENE ✦
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

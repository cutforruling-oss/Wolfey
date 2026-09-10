/**
 * Unified Anime/Game Sound Effects Manager
 * Plays custom MP3s from /assets/audio/ with instant Web Audio synthesizer fallbacks.
 */

export type SoundEffectType =
  | 'click-enter'
  | 'nav'
  | 'section-next'
  | 'section-prev'
  | 'anime-activate'
  | 'about'
  | 'skills'
  | 'tools'
  | 'projects'
  | 'gallery'
  | 'image-open'
  | 'comments'
  | 'social'
  | 'music-play'
  | 'music-pause'
  | 'music-prev'
  | 'music-next'
  | 'mute'
  | 'unmute'
  | 'bg-change'
  | 'atmosphere-sakura'
  | 'atmosphere-cyber'
  | 'atmosphere-spirit'
  | 'atmosphere-off'
  | 'hide'
  | 'show'
  | 'volume'
  | 'scroll';

const AUDIO_PATHS: Record<string, string> = {
  'click-enter': '/assets/audio/click-enter.mp3',
  'nav': '/assets/audio/nav.mp3',
  'about': '/assets/audio/about.mp3',
  'skills': '/assets/audio/skills.mp3',
  'tools': '/assets/audio/skills.mp3',
  'projects': '/assets/audio/projects.mp3',
  'gallery': '/assets/audio/gallery.mp3',
  'image-open': '/assets/audio/image-open.mp3',
  'comments': '/assets/audio/comments.mp3',
  'social': '/assets/audio/social.mp3',
  'music-play': '/assets/audio/music-play.mp3',
  'music-pause': '/assets/audio/music-pause.mp3',
  'hide': '/assets/audio/hide.mp3',
  'show': '/assets/audio/show.mp3',
};

// Audio element cache for instant replay
const audioCache: Map<string, HTMLAudioElement[]> = new Map();
let audioContext: AudioContext | null = null;
let lastScrollSoundTime = 0;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioContext = new AudioCtx();
    }
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

/**
 * High-quality Web Audio synth fallback if HTML5 Audio is blocked or unavailable
 */
function playSynthFallback(type: SoundEffectType) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  try {
    switch (type) {
      case 'click-enter': {
        // Deep cinematic bass boom + crystal chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(70, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 1.2);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.2);

        // Chime
        const chime = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(880, now + 0.1);
        chime.frequency.exponentialRampToValueAtTime(1760, now + 0.4);
        chimeGain.gain.setValueAtTime(0.25, now + 0.1);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        chime.connect(chimeGain);
        chimeGain.connect(ctx.destination);
        chime.start(now + 0.1);
        chime.stop(now + 1.0);
        break;
      }
      case 'nav': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }
      case 'section-next': {
        // Futuristic forward cinematic laser-chime (ascending arpeggio + whoosh)
        [587, 880, 1175, 1760].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + idx * 0.035);
          osc.frequency.exponentialRampToValueAtTime(f * 1.3, now + idx * 0.035 + 0.12);
          gain.gain.setValueAtTime(0.16, now + idx * 0.035);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.035 + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.035);
          osc.stop(now + idx * 0.035 + 0.18);
        });
        break;
      }
      case 'section-prev': {
        // Futuristic backward cinematic rewind-whoosh (descending resonant tone)
        [1568, 1175, 880, 523].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.035);
          osc.frequency.exponentialRampToValueAtTime(f * 0.7, now + idx * 0.035 + 0.14);
          gain.gain.setValueAtTime(0.16, now + idx * 0.035);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.035 + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.035);
          osc.stop(now + idx * 0.035 + 0.18);
        });
        break;
      }
      case 'anime-activate': {
        // High-energy anime power activation (deep power burst + ascending shimmer)
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = 'sawtooth';
        sub.frequency.setValueAtTime(65, now);
        sub.frequency.exponentialRampToValueAtTime(140, now + 0.35);
        subGain.gain.setValueAtTime(0.35, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        sub.connect(subGain);
        subGain.connect(ctx.destination);
        sub.start(now);
        sub.stop(now + 0.6);

        [880, 1320, 1760, 2640].forEach((f, idx) => {
          const spark = ctx.createOscillator();
          const sparkGain = ctx.createGain();
          spark.type = 'sine';
          spark.frequency.setValueAtTime(f, now + 0.08 + idx * 0.04);
          sparkGain.gain.setValueAtTime(0.2, now + 0.08 + idx * 0.04);
          sparkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          spark.connect(sparkGain);
          sparkGain.connect(ctx.destination);
          spark.start(now + 0.08 + idx * 0.04);
          spark.stop(now + 0.5);
        });
        break;
      }
      case 'tools': {
        [523, 784, 1046].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + idx * 0.04);
          gain.gain.setValueAtTime(0.18, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.16);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.16);
        });
        break;
      }
      case 'about': {
        [740, 988].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.08);
          gain.gain.setValueAtTime(0.18, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.2);
        });
        break;
      }
      case 'skills': {
        [659, 830, 1046].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + idx * 0.05);
          gain.gain.setValueAtTime(0.2, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.15);
        });
        break;
      }
      case 'projects': {
        [880, 1318].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.07);
          gain.gain.setValueAtTime(0.2, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.18);
        });
        break;
      }
      case 'gallery': {
        [1046, 1318, 1568, 2093].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.04);
          gain.gain.setValueAtTime(0.15, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.2);
        });
        break;
      }
      case 'image-open': {
        [1174, 1480, 1760].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.06);
          gain.gain.setValueAtTime(0.2, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.35);
        });
        break;
      }
      case 'comments': {
        [784, 1175].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.07);
          gain.gain.setValueAtTime(0.2, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.2);
        });
        break;
      }
      case 'social': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1100, now);
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.12);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }
      case 'music-play': {
        [523, 659, 784].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.04);
          gain.gain.setValueAtTime(0.18, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.3);
        });
        break;
      }
      case 'music-pause': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(250, now + 0.25);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case 'music-prev': {
        [659, 523].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.05);
          gain.gain.setValueAtTime(0.18, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.18);
        });
        break;
      }
      case 'music-next': {
        [523, 784].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.05);
          gain.gain.setValueAtTime(0.18, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.18);
        });
        break;
      }
      case 'mute': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'unmute': {
        [330, 660].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.06);
          gain.gain.setValueAtTime(0.15, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.2);
        });
        break;
      }
      case 'bg-change': {
        // Deep cinematic camera warp / shutter whoosh
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.35);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }
      case 'atmosphere-sakura': {
        // Delicate oriental glass chime with shimmering overtone
        [1318, 1567, 1975, 2637].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.04);
          gain.gain.setValueAtTime(0.16, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.45);
        });
        break;
      }
      case 'atmosphere-cyber': {
        // High-tech electric plasma zap / cyber laser ping
        const zap = ctx.createOscillator();
        const zapGain = ctx.createGain();
        zap.type = 'sawtooth';
        zap.frequency.setValueAtTime(1400, now);
        zap.frequency.exponentialRampToValueAtTime(320, now + 0.12);
        zapGain.gain.setValueAtTime(0.2, now);
        zapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        zap.connect(zapGain);
        zapGain.connect(ctx.destination);
        zap.start(now);
        zap.stop(now + 0.14);

        const ping = ctx.createOscillator();
        const pingGain = ctx.createGain();
        ping.type = 'sine';
        ping.frequency.setValueAtTime(2200, now + 0.05);
        pingGain.gain.setValueAtTime(0.15, now + 0.05);
        pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        ping.connect(pingGain);
        pingGain.connect(ctx.destination);
        ping.start(now + 0.05);
        ping.stop(now + 0.3);
        break;
      }
      case 'atmosphere-spirit': {
        // Ethereal mystical harmonic chord / celestial spirit chime
        [523, 784, 988, 1318].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.03);
          osc.frequency.linearRampToValueAtTime(f * 1.015, now + 0.6);
          gain.gain.setValueAtTime(0.12, now + idx * 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.03);
          osc.stop(now + 0.65);
        });
        break;
      }
      case 'atmosphere-off': {
        // Soft mechanical powered-down click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case 'hide': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(750, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.18);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      }
      case 'show': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.18);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      }
      case 'volume': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }
      case 'scroll': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.03);
        break;
      }
    }
  } catch (err) {
    console.debug('Synth fallback failed', err);
  }
}

/**
 * Plays the specified sound effect with immediate response
 */
export function playSfx(type: SoundEffectType, volume = 0.75) {
  if (typeof window === 'undefined') return;

  // Rate-limit scroll sound to prevent audio spam
  if (type === 'scroll') {
    const now = Date.now();
    if (now - lastScrollSoundTime < 80) return;
    lastScrollSoundTime = now;
  }

  const path = AUDIO_PATHS[type];
  if (!path) {
    // Synth fallback directly for volume/scroll
    playSynthFallback(type);
    return;
  }

  try {
    let pool = audioCache.get(type);
    if (!pool) {
      pool = [];
      audioCache.set(type, pool);
    }

    // Find an idle audio element or create a new one (pool up to 4 per sound)
    let audio = pool.find((a) => a.paused || a.ended);
    if (!audio && pool.length < 4) {
      audio = new Audio(path);
      pool.push(audio);
    } else if (!audio && pool.length > 0) {
      audio = pool[0];
      audio.currentTime = 0;
    } else if (!audio) {
      audio = new Audio(path);
      pool.push(audio);
    }

    audio.volume = Math.max(0, Math.min(1, volume));
    audio.currentTime = 0;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback to Web Audio synth if file audio play fails
        playSynthFallback(type);
      });
    }
  } catch {
    playSynthFallback(type);
  }
}

/**
 * Preload all main sound effects into browser cache
 */
export function preloadAllSfx() {
  if (typeof window === 'undefined') return;
  Object.entries(AUDIO_PATHS).forEach(([type, path]) => {
    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = path;
      audioCache.set(type, [audio]);
    } catch {
      // ignore
    }
  });
}

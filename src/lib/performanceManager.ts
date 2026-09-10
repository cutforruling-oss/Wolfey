/**
 * Performance Manager for Wolfey's Portfolio
 * Adapts visual effects, particles, 3D transforms, blur, and video quality
 * dynamically based on device capability (High-End PC vs Balanced vs Low-End PC & Mobile)
 */

export type PerformanceTier = 'high' | 'balanced' | 'performance';

export interface PerformanceSettings {
  tier: PerformanceTier;
  particleMultiplier: number;
  enableMotionTrails: boolean;
  enableCanvasShadows: boolean;
  enable3DTilt: boolean;
  enableHeavyBlur: boolean;
  videoQuality: 'medium' | 'high';
  enableBubbleCursor: boolean;
  reducedMotion: boolean;
  isMobile: boolean;
}

// Auto-detect optimal performance tier for current device
export function detectDeviceTier(): PerformanceTier {
  if (typeof window === 'undefined') return 'balanced';

  // 1. Check user preference override in localStorage
  const savedTier = localStorage.getItem('wolfey_perf_tier') as PerformanceTier | null;
  if (savedTier === 'high' || savedTier === 'balanced' || savedTier === 'performance') {
    return savedTier;
  }

  // 2. Check prefers-reduced-motion
  const prefersReduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    return 'performance';
  }

  // 3. Network / Battery Save Data hint
  const nav = navigator as any;
  if (nav.connection?.saveData) {
    return 'performance';
  }

  // 4. Mobile / Small Screen detection
  const isSmallScreen = window.innerWidth < 768;
  const isTouch = 'ontouchstart' in window || nav.maxTouchPoints > 1;
  const ua = navigator.userAgent.toLowerCase();
  const isMobileOS = /android|iphone|ipad|ipod|windows phone/i.test(ua);

  if (isMobileOS || (isSmallScreen && isTouch)) {
    return 'performance';
  }

  // 5. Desktop systems default to 'high' or 'balanced'
  const cores = nav.hardwareConcurrency || 8;
  if (cores >= 6 && window.innerWidth >= 1200) {
    return 'high';
  }

  return 'balanced';
}

export function getPerformanceSettings(tier: PerformanceTier): PerformanceSettings {
  const isMobile =
    typeof window !== 'undefined'
      ? window.innerWidth < 768 || ('ontouchstart' in window && window.innerWidth < 1024)
      : false;

  const reducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  switch (tier) {
    case 'performance':
      return {
        tier: 'performance',
        particleMultiplier: 0.4, // Light particle load
        enableMotionTrails: false,
        enableCanvasShadows: false,
        enable3DTilt: false, // Disabled on mobile / low-end
        enableHeavyBlur: false,
        videoQuality: 'high',
        enableBubbleCursor: false,
        reducedMotion,
        isMobile: true,
      };

    case 'balanced':
      return {
        tier: 'balanced',
        particleMultiplier: 0.75, // Balanced smooth particles
        enableMotionTrails: true,
        enableCanvasShadows: true,
        enable3DTilt: true, // Subtle 3D tilt enabled
        enableHeavyBlur: true,
        videoQuality: 'high',
        enableBubbleCursor: !isMobile,
        reducedMotion,
        isMobile,
      };

    case 'high':
    default:
      return {
        tier: 'high',
        particleMultiplier: 1.0, // Full visual quality
        enableMotionTrails: true,
        enableCanvasShadows: true,
        enable3DTilt: true, // Subtle 3D tilt enabled
        enableHeavyBlur: true,
        videoQuality: 'high',
        enableBubbleCursor: !isMobile,
        reducedMotion,
        isMobile: false,
      };
  }
}

// Global listener for tier changes
type TierListener = (tier: PerformanceTier, settings: PerformanceSettings) => void;
const listeners = new Set<TierListener>();

let currentTier: PerformanceTier = detectDeviceTier();
let currentSettings: PerformanceSettings = getPerformanceSettings(currentTier);

// Apply dataset attribute to HTML root for CSS optimizations
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-perf-tier', currentTier);
}

export function setPerformanceTier(tier: PerformanceTier): void {
  currentTier = tier;
  currentSettings = getPerformanceSettings(tier);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('wolfey_perf_tier', tier);
  }
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-perf-tier', tier);
  }
  listeners.forEach((l) => l(currentTier, currentSettings));
}

export function getCurrentTier(): PerformanceTier {
  return currentTier;
}

export function getCurrentSettings(): PerformanceSettings {
  return currentSettings;
}

export function subscribePerformance(listener: TierListener): () => void {
  listeners.add(listener);
  listener(currentTier, currentSettings);
  return () => {
    listeners.delete(listener);
  };
}

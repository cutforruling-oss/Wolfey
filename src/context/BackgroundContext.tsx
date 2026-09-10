import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { BACKGROUND_VIDEOS, BackgroundVideoItem } from '../data/backgroundVideos';
import { playSfx } from '../lib/soundManager';
import { registerRealClick } from '../lib/firebase';

interface BackgroundContextType {
  currentBgIndex: number;
  currentVideo: BackgroundVideoItem;
  incomingBgIndex: number | null;
  incomingVideo: BackgroundVideoItem | null;
  isTransitioning: boolean;
  isIncomingReady: boolean;
  totalBackgrounds: number;
  setBgIndex: (index: number) => void;
  nextBg: (e?: React.MouseEvent) => void;
  prevBg: (e?: React.MouseEvent) => void;
  setIsIncomingReady: (ready: boolean) => void;
  finalizeTransition: () => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentBgIndex, setCurrentBgIndex] = useState<number>(0); // Starts at #1 (index 0)
  const [incomingBgIndex, setIncomingBgIndex] = useState<number | null>(null);
  const [isIncomingReady, setIsIncomingReady] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const total = BACKGROUND_VIDEOS.length; // Exactly 10

  const switchBackground = useCallback((targetIdx: number) => {
    // Normalization for 0 to 9
    const normalized = (targetIdx % total + total) % total;
    if (normalized === currentBgIndex && incomingBgIndex === null) return;

    playSfx('bg-change');
    setIsTransitioning(true);
    setIncomingBgIndex(normalized);
    setIsIncomingReady(false);

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    // Safety fallback: if iframe fails to report ready within 850ms, commit transition
    transitionTimeoutRef.current = setTimeout(() => {
      setCurrentBgIndex(normalized);
      setIncomingBgIndex(null);
      setIsTransitioning(false);
      setIsIncomingReady(false);
    }, 900);

    registerRealClick(`change_bg_${normalized + 1}`);
  }, [currentBgIndex, incomingBgIndex, total]);

  const finalizeTransition = useCallback(() => {
    if (incomingBgIndex !== null) {
      setCurrentBgIndex(incomingBgIndex);
      setIncomingBgIndex(null);
      setIsTransitioning(false);
      setIsIncomingReady(false);
    }
  }, [incomingBgIndex]);

  const nextBg = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Circular loop: #10 (index 9) -> #1 (index 0)
    const nextIdx = (currentBgIndex + 1) % total;
    switchBackground(nextIdx);
  }, [currentBgIndex, switchBackground, total]);

  const prevBg = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Circular loop: #1 (index 0) -> #10 (index 9)
    const prevIdx = (currentBgIndex - 1 + total) % total;
    switchBackground(prevIdx);
  }, [currentBgIndex, switchBackground, total]);

  const currentVideo = BACKGROUND_VIDEOS[currentBgIndex] || BACKGROUND_VIDEOS[0];
  const incomingVideo = incomingBgIndex !== null ? BACKGROUND_VIDEOS[incomingBgIndex] : null;

  return (
    <BackgroundContext.Provider
      value={{
        currentBgIndex,
        currentVideo,
        incomingBgIndex,
        incomingVideo,
        isTransitioning,
        isIncomingReady,
        totalBackgrounds: total,
        setBgIndex: switchBackground,
        nextBg,
        prevBg,
        setIsIncomingReady,
        finalizeTransition,
      }}
    >
      {children}
    </BackgroundContext.Provider>
  );
};

export const useBackground = (): BackgroundContextType => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WOLFEY_DATA } from './data/wolfeyData';
import { BackgroundVideo } from './components/BackgroundVideo';
import { WelcomeScreen } from './components/WelcomeScreen';
import { WolfeyMusicPlayer } from './components/WolfeyMusicPlayer';
import { ProfileCard } from './components/ProfileCard';
import { BubbleCursor } from './components/BubbleCursor';
import { AnimeCinematicTransition } from './components/AnimeCinematicTransition';
import { AtmosphereCanvas } from './components/Atmosphere/AtmosphereCanvas';
import { AtmosphereSelector } from './components/Atmosphere/AtmosphereSelector';
import { AtmosphereOption, ActiveTab } from './types';
import { registerRealView } from './lib/firebase';
import { BackgroundProvider } from './context/BackgroundContext';
import { PerformanceProvider } from './context/PerformanceContext';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isEntered, setIsEntered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [atmosphere, setAtmosphere] = useState<AtmosphereOption>('sakura');
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');

  const hasRegisteredViewRef = useRef(false);

  // When visitor clicks "CLICK TO ENTER" on Front Page:
  // 1. Anime-style cinematic transition starts with entrance sound
  // 2. Real view is recorded in Firebase Firestore immediately on click
  // 3. Main Page opens with Song #1 and live synced view count
  const handleStartEnter = useCallback(() => {
    setIsTransitioning(true);
    if (!hasRegisteredViewRef.current) {
      hasRegisteredViewRef.current = true;
      registerRealView().catch(() => {});
    }
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setIsEntered(true);
    setIsTransitioning(false);
    if (!hasRegisteredViewRef.current) {
      hasRegisteredViewRef.current = true;
      registerRealView().catch(() => {});
    }
  }, []);

  return (
    <PerformanceProvider>
      <BackgroundProvider>
        <div className="relative min-h-screen w-screen overflow-x-hidden flex items-center justify-center select-none bg-[#0a0a14] text-white">
          {/* Interactive Micro-Bubble Trail Canvas */}
          <BubbleCursor />

          {/* Animated Background System: Exactly 10 curated scenes, circular loop, muted */}
          <BackgroundVideo
            isEntered={isEntered}
            onOpenBackgroundTab={() => setActiveTab('background')}
          />

          {/* Global 3D Anime Atmosphere Particle Canvas */}
          <AtmosphereCanvas atmosphere={atmosphere} isEntered={isEntered} />

          {/* 3D Anime Atmosphere Controls Dock (Hidden by default on Main Page, toggleable) */}
          <AtmosphereSelector
            currentAtmosphere={atmosphere}
            onChangeAtmosphere={setAtmosphere}
            isEntered={isEntered}
          />

          {/* Front / Click-to-Enter Page: NO music or background controls are shown */}
          <WelcomeScreen
            isEntered={isEntered || isTransitioning}
            onEnter={handleStartEnter}
            titleGifsUrl={WOLFEY_DATA.titleGifsUrl}
          />

          {/* 3D Anime Cinematic Speed Transition overlay upon entering */}
          <AnimatePresence>
            {isTransitioning && (
              <AnimeCinematicTransition onComplete={handleTransitionComplete} />
            )}
          </AnimatePresence>

          {/* Music Player System: ONLY the 10 specified songs, Song #1 autostarts, hidden by default */}
          <WolfeyMusicPlayer isEntered={isEntered} />

          {/* Main Content Area (Second / Main Page) */}
          {isEntered && (
            <motion.main
              initial={{ opacity: 0, scale: 1.12, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-20 flex flex-col items-center justify-center w-full min-h-screen py-10 px-3 sm:px-6"
            >
              <ProfileCard
                data={WOLFEY_DATA}
                isEntered={isEntered}
                activeTab={activeTab}
                onSelectTab={setActiveTab}
              />
            </motion.main>
          )}
        </div>
      </BackgroundProvider>
    </PerformanceProvider>
  );
}


import React, { useState, useEffect, useRef } from 'react';
import { ProfileData, ActiveTab } from '../types';
import { TabNavigation } from './Tabs/TabNavigation';
import { AboutTab } from './Tabs/AboutTab';
import { SkillsTab } from './Tabs/SkillsTab';
import { ToolsTab } from './Tabs/ToolsTab';
import { ProjectsTab } from './Tabs/ProjectsTab';
import { GalleryTab } from './Tabs/GalleryTab';
import { MusicTab } from './Tabs/MusicTab';
import { BackgroundTab } from './Tabs/BackgroundTab';
import { CommentsTab } from './Tabs/CommentsTab';
import { PaidWorkSection } from './PaidWork/PaidWorkSection';
import { SectionNavigationDock, SECTIONS_ORDER } from './SectionNavigationDock';
import { DiscordWidget } from './Widgets/DiscordWidget';
import { WeatherWidget } from './Widgets/WeatherWidget';
import { SocialLinks } from './Widgets/SocialLinks';
import { FriendsSection } from './Friends/FriendsSection';
import { subscribeToStats, AnalyticsStats, registerRealClick, getInitialCachedStats } from '../lib/firebase';
import { playSfx } from '../lib/soundManager';
import { Briefcase, MapPin, Eye, BadgeCheck, MousePointerClick, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileCardProps {
  data: ProfileData;
  isEntered: boolean;
  activeTab?: ActiveTab;
  onSelectTab?: (tab: ActiveTab) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  data,
  isEntered,
  activeTab: propActiveTab,
  onSelectTab: propOnSelectTab,
}) => {
  const [internalTab, setInternalTab] = useState<ActiveTab>('profile');
  const activeTab = propActiveTab !== undefined ? propActiveTab : internalTab;
  const setActiveTab = (tab: ActiveTab) => {
    if (propOnSelectTab) propOnSelectTab(tab);
    setInternalTab(tab);
  };
  const [slideDirection, setSlideDirection] = useState<number>(1);
  const [typewriterText, setTypewriterText] = useState('');
  const [commentCount, setCommentCount] = useState(3);
  const [stats, setStats] = useState<AnalyticsStats>(() => getInitialCachedStats());
  const cardRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // 3D Tilt states
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  // Subscribe to real-time views and clicks from Firebase Firestore
  useEffect(() => {
    const unsub = subscribeToStats((newStats) => {
      setStats(newStats);
    });
    return () => unsub();
  }, []);

  // Typewriter effect for "Wolfey"
  useEffect(() => {
    if (!isEntered) return;

    const fullText = data.name;
    let index = 0;
    let timer: NodeJS.Timeout;

    const tick = () => {
      if (index <= fullText.length) {
        setTypewriterText(fullText.slice(0, index));
        index++;
        timer = setTimeout(tick, 150);
      } else {
        setTypewriterText(fullText);
      }
    };

    timer = setTimeout(tick, 300);
    return () => clearTimeout(timer);
  }, [isEntered, data.name]);

  // Handle 3D Tilt on mouse move (Extremely subtle 3D depth, max ~0.9deg, disabled on touch/mobile)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    if (
      typeof window !== 'undefined' &&
      (window.innerWidth < 768 || ('ontouchstart' in window && window.innerWidth < 1024))
    ) {
      return;
    }
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Reduced by ~85%: max ~0.9° tilt for subtle, stable, calm 3D depth
    const rotX = -((y - centerY) / centerY) * 0.9;
    const rotY = ((x - centerX) / centerX) * 0.9;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.12,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleProfileInteractiveClick = () => {
    registerRealClick('profile_card_click');
  };

  const handleSelectTabWithDirection = (targetTab: ActiveTab, dir?: 'next' | 'prev') => {
    if (dir) {
      setSlideDirection(dir === 'next' ? 1 : -1);
    } else {
      const currentIdx = SECTIONS_ORDER.findIndex((s) => s.id === activeTab);
      const targetIdx = SECTIONS_ORDER.findIndex((s) => s.id === targetTab);
      setSlideDirection(targetIdx >= currentIdx ? 1 : -1);
    }
    setActiveTab(targetTab);
  };

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

    // Check if horizontal swipe is dominant and above threshold
    if (Math.abs(diffX) > 55 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
      const currentIdx = SECTIONS_ORDER.findIndex((s) => s.id === activeTab);
      if (diffX < 0 && currentIdx < SECTIONS_ORDER.length - 1) {
        // Swipe Left -> Next Section
        playSfx('section-next');
        handleSelectTabWithDirection(SECTIONS_ORDER[currentIdx + 1].id, 'next');
      } else if (diffX > 0 && currentIdx > 0) {
        // Swipe Right -> Previous Section
        playSfx('section-prev');
        handleSelectTabWithDirection(SECTIONS_ORDER[currentIdx - 1].id, 'prev');
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  return (
    <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-[700px] md:max-w-[820px] lg:max-w-[880px] xl:max-w-[940px] px-2 sm:px-4">
      {/* Top Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        onSelectTab={(tab) => handleSelectTabWithDirection(tab)}
        commentsCount={commentCount}
        galleryCount={data.galleryPosts.length}
      />

      {/* 3D Anime Section Navigation Dock: PREVIOUS ◀ | SECTION NAME | NEXT ▶ */}
      <SectionNavigationDock
        activeTab={activeTab}
        onSelectTab={handleSelectTabWithDirection}
      />

      {/* Main Glassmorphic Profile Card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleProfileInteractiveClick}
        id="profile-master-card"
        className="card-gradient-border relative w-full rounded-[14px] overflow-hidden transition-all duration-300 ease-out"
        style={{
          backgroundColor: 'rgba(30, 30, 38, 0.52)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65), 0 0 35px rgba(162, 230, 255, 0.1)',
          transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Specular Glare Overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[14px] z-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.2) 0%, transparent 60%)`,
            opacity: glarePos.opacity,
          }}
        />

        {/* Tab Content Panes */}
        <div className="relative z-10 w-full">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="tab-profile"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col"
              >
                {/* Inside Banner */}
                <div className="relative w-full h-[150px] sm:h-[180px] overflow-hidden rounded-t-[14px]">
                  <img
                    src={data.bannerUrl}
                    alt="Wolfey Profile Banner"
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-[#121218]/90" />
                </div>

                {/* Avatar Section */}
                <div className="relative flex flex-col items-center -mt-[75px] px-5 sm:px-6">
                  <div className="relative w-[130px] h-[130px] sm:w-[150px] sm:h-[150px] flex-shrink-0">
                    <img
                      src={data.avatarUrl}
                      alt={data.name}
                      className="w-full h-full rounded-full object-cover border-4 border-black/50 shadow-2xl select-none"
                    />
                    {data.avatarDecorationUrl && (
                      <img
                        src={data.avatarDecorationUrl}
                        alt="Avatar decoration"
                        className="absolute -top-[14px] -left-[14px] w-[158px] h-[158px] sm:w-[178px] sm:h-[178px] pointer-events-none select-none max-w-none z-10"
                      />
                    )}
                  </div>

                  {/* Username & Badges */}
                  <div className="flex flex-col items-center mt-3 text-center w-full">
                    <div className="flex items-center justify-center gap-2">
                      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-white neon-text">
                        {typewriterText || data.name}
                        <span className="inline-block w-[3px] h-6 bg-sky-300 ml-1 animate-pulse" />
                      </h1>

                      {/* Verified Badge */}
                      <span
                        title="Verified Creator & Developer"
                        className="p-1 rounded-full bg-sky-400/20 text-sky-300 border border-sky-400/40"
                      >
                        <BadgeCheck size={14} />
                      </span>

                      {/* Flag Badge */}
                      <span
                        title={`Based in India ${data.locationFlag}`}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-stone-200 border border-white/15"
                      >
                        <span>{data.locationFlag}</span>
                        <span>{data.location}</span>
                      </span>
                    </div>

                    {/* All Main Roles */}
                    <div className="flex items-center justify-center gap-1.5 flex-wrap mt-2.5 max-w-[460px]">
                      {data.mainRoles.map((role) => (
                        <span
                          key={role}
                          className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-sky-500/15 text-sky-200 border border-sky-400/30 whitespace-nowrap"
                        >
                          {role}
                        </span>
                      ))}
                    </div>

                    {/* Real Views & Real Clicks Live Meta Bar */}
                    <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs text-stone-300 mt-3.5 flex-wrap bg-black/45 px-3.5 py-2 rounded-xl border border-white/10 w-full shadow-inner">
                      <div className="flex items-center gap-1.5" title="Verified Real Visitors from Firebase Firestore">
                        <Eye size={14} className="text-sky-400" />
                        <span className="font-mono text-white font-semibold">
                          <motion.span
                            key={stats.views}
                            initial={{ opacity: 0.5, scale: 0.95, y: -2 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="inline-block text-sky-300 font-bold"
                          >
                            {stats.views.toLocaleString()}
                          </motion.span>{' '}
                          Views
                        </span>
                      </div>
                      <span className="text-white/20">•</span>
                      <div className="flex items-center gap-1.5" title="Real Tracked Clicks from Firebase Firestore">
                        <MousePointerClick size={14} className="text-emerald-400" />
                        <span className="font-mono text-white font-semibold">
                          <motion.span
                            key={stats.clicks}
                            initial={{ opacity: 0.5, scale: 0.95, y: -2 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="inline-block text-emerald-300 font-bold"
                          >
                            {stats.clicks.toLocaleString()}
                          </motion.span>{' '}
                          Clicks
                        </span>
                      </div>
                      <span className="text-white/20">•</span>
                      <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        <span className="font-mono text-stone-300">Live Firestore</span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent my-4" />

                  {/* Embedded Live Widgets (Discord + India Weather) */}
                  <div className="flex flex-col gap-2.5 w-full">
                    <DiscordWidget
                      username="dev_arie"
                      avatarUrl={data.avatarUrl}
                      decorationUrl={data.avatarDecorationUrl}
                    />

                    <WeatherWidget locationName="India" countryCode="IN" />
                  </div>

                  {/* ONLY Discord, YouTube, and Instagram Social Links */}
                  <div className="w-full pb-2">
                    <SocialLinks links={data.socials} />
                  </div>

                  {/* 👥 MY FRIENDS AREA — Positioned at the very end of MY PROFILE, directly before ABOUT ME */}
                  <div className="w-full pt-2 pb-3">
                    <FriendsSection
                      onContinueToAbout={() => handleSelectTabWithDirection('about', 'next')}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'about' && (
              <motion.div
                key="tab-about"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="p-4 sm:p-6"
              >
                <AboutTab />
              </motion.div>
            )}

            {activeTab === 'skills' && (
              <motion.div
                key="tab-skills"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="p-4 sm:p-5"
              >
                <SkillsTab
                  skills={data.skills}
                  onNavigateToTools={() => handleSelectTabWithDirection('tools', 'next')}
                  onNavigateToPaidWork={() => handleSelectTabWithDirection('paidWork', 'next')}
                />
              </motion.div>
            )}

            {activeTab === 'paidWork' && (
              <motion.div
                key="tab-paid-work"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="p-4 sm:p-5"
              >
                <PaidWorkSection />
              </motion.div>
            )}

            {activeTab === 'tools' && (
              <motion.div
                key="tab-tools"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="p-4 sm:p-5"
              >
                <ToolsTab />
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div
                key="tab-projects"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="p-4 sm:p-5"
              >
                <ProjectsTab projects={data.projects} />
              </motion.div>
            )}

            {activeTab === 'gallery' && (
              <motion.div
                key="tab-gallery"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="p-4 sm:p-5"
              >
                <GalleryTab posts={data.galleryPosts} />
              </motion.div>
            )}

            {activeTab === 'music' && (
              <motion.div
                key="tab-music"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="p-4 sm:p-5"
              >
                <MusicTab />
              </motion.div>
            )}

            {activeTab === 'background' && (
              <motion.div
                key="tab-background"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="p-4 sm:p-5"
              >
                <BackgroundTab />
              </motion.div>
            )}

            {activeTab === 'comments' && (
              <motion.div
                key="tab-comments"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="p-4 sm:p-5"
              >
                <CommentsTab onCommentCountChange={setCommentCount} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

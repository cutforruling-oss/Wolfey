export type ActiveTab = 'profile' | 'about' | 'skills' | 'paidWork' | 'tools' | 'projects' | 'gallery' | 'music' | 'background' | 'comments';

export type AtmosphereOption = 'sakura' | 'cyber' | 'spirit' | 'off';

export interface PaidServicePricing {
  startingInr: number;
  startingUsd: number;
  hourlyInr: number;
  hourlyUsd: number;
  dailyInr: number;
  dailyUsd: number;
  monthlyInr: number;
  monthlyUsd: number;
  smallInr: number;
  smallUsd: number;
  mediumInr: number;
  mediumUsd: number;
}

export interface PaidServiceItem {
  id: string;
  title: string;
  icon: string;
  service: string;
  pricing: PaidServicePricing;
  accentColor: string;
  tags: string[];
}

export interface GalleryPost {
  id: string;
  title: string;
  mediaUrl: string;
  description: string;
  category: 'Anime Art' | 'Character Designs' | 'Game Design' | 'Graphic Design' | '3D Work' | 'Video Edits' | 'Animation' | 'Artist';
  dimensions?: string;
  tags?: string[];
  year?: string;
}

export interface SkillItem {
  id: string;
  title: string;
  icon: string; // emoji or lucide key
  tagline: string;
  description: string;
  technologies: string[];
  level: number; // percentage
  accentColor: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: 'Games' | 'Websites' | 'Graphics' | 'Animations' | 'Video Edits' | '3D Designs' | 'Anime Art';
  description: string;
  mediaUrl: string;
  badge: string;
  tags: string[];
  features: string[];
  liveUrl?: string;
  githubUrl?: string;
  year: string;
  isComingSoon?: boolean;
  comingSoonStage?: string;
  comingSoonTools?: string[];
}

export interface SocialLink {
  id: string;
  title: string;
  name: 'discord' | 'youtube' | 'instagram';
  usernameDisplay: string;
  link: string;
  badge?: string;
  iconImg?: string;
  dominantColor?: string;
}

export interface FriendProfile {
  id: string;
  name: string;
  instagramHandle: string;
  instagramUrl: string;
  category: string;
  age?: number;
  description: string;
  bulletPoints: string[];
  accentColor: string;
  secondaryColor: string;
  auraGlow: string;
  symbol: string;
  avatarIconType: 'fitness' | 'bike' | 'personal' | 'travel_gym' | 'family';
}

export interface ProfileData {
  id: string;
  name: string;
  tagline: string;
  location: string;
  locationFlag: string;
  aboutText: string;
  avatarUrl: string;
  avatarDecorationUrl: string;
  bannerUrl: string;
  cursorUrl: string;
  titleGifsUrl: string;
  mainRoles: string[];
  socials: SocialLink[];
  skills: SkillItem[];
  projects: ProjectItem[];
  galleryPosts: GalleryPost[];
}

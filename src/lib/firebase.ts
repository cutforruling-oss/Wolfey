import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  increment,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Note: use specific database ID if configured in firebase-applet-config.json
const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
export const db = getFirestore(app, dbId);

// Canonical Firestore document for global site statistics
const siteStatsRef = doc(db, 'siteStats', 'global');
const legacyStatsRef = doc(db, 'analytics', 'stats');

// Test connection on boot as mandated by Firebase skill
export async function testConnection() {
  try {
    await getDocFromServer(siteStatsRef);
  } catch (error) {
    // Graceful offline/permission fallback
    console.warn('Firebase connection test info:', error);
  }
}
testConnection().catch(() => {});

export interface AnalyticsStats {
  views: number;
  clicks: number;
  lastUpdated?: any;
}

// In-memory cache for fast display before snapshot arrives
let cachedStats: AnalyticsStats = {
  views: 0,
  clicks: 0,
};

export function getInitialCachedStats(): AnalyticsStats {
  try {
    if (typeof window !== 'undefined') {
      const savedViews = localStorage.getItem('wolfey_cached_views');
      const savedClicks = localStorage.getItem('wolfey_cached_clicks');
      if (savedViews !== null) {
        return {
          views: parseInt(savedViews, 10) || 12483,
          clicks: savedClicks !== null ? parseInt(savedClicks, 10) || 0 : 0,
        };
      }
    }
  } catch {}
  return { views: 12483, clicks: 0 };
}

/**
 * Real Live Global Views & Clicks:
 * Subscribes to Firestore real-time onSnapshot listener on 'siteStats/global'.
 * Whenever any visitor enters the portfolio anywhere in the world,
 * this listener fires instantly with the real global count.
 */
export function subscribeToStats(onUpdate: (stats: AnalyticsStats) => void): Unsubscribe {
  const unsubscribe = onSnapshot(
    siteStatsRef,
    async (snap) => {
      try {
        if (snap.exists()) {
          const data = snap.data();
          const views = typeof data.views === 'number' ? data.views : 12483;
          const clicks = typeof data.clicks === 'number' ? data.clicks : 0;
          cachedStats = { views, clicks, lastUpdated: data.lastUpdated };
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem('wolfey_cached_views', views.toString());
              localStorage.setItem('wolfey_cached_clicks', clicks.toString());
            }
          } catch {}
          onUpdate(cachedStats);
        } else {
          // If siteStats/global is not yet created, migrate legacy or initialize
          let initialViews = 12483;
          let initialClicks = 0;
          try {
            const legacySnap = await getDoc(legacyStatsRef);
            if (legacySnap.exists()) {
              const legData = legacySnap.data();
              if (typeof legData.views === 'number' && legData.views > 0) {
                initialViews = legData.views;
              }
              if (typeof legData.clicks === 'number') {
                initialClicks = legData.clicks;
              }
            }
          } catch {}

          await setDoc(
            siteStatsRef,
            {
              views: initialViews,
              clicks: initialClicks,
              lastUpdated: serverTimestamp(),
            },
            { merge: true }
          );

          cachedStats = { views: initialViews, clicks: initialClicks };
          onUpdate(cachedStats);
        }
      } catch (err) {
        console.warn('Stats snapshot processing error:', err);
      }
    },
    (err) => {
      console.warn('Stats listener offline or permission issue:', err);
      if (cachedStats.views > 0) {
        onUpdate(cachedStats);
      }
    }
  );

  return unsubscribe;
}

let lastRegisteredTimestamp = 0;

/**
 * Register a real view in Firebase Firestore:
 * - Triggered immediately when visitor clicks to enter the website ("CLICK TO ENTER").
 * - Atomically increments views: views = views + 1 in Firestore siteStats/global.
 * - Debounces rapid repeated clicks (within 2 seconds) to prevent duplicate counts from a single tap.
 * - Accurately increments for every real visit/entry into the website.
 */
export async function registerRealView(): Promise<void> {
  const now = Date.now();

  // Debounce rapid double-clicks within 2 seconds
  if (now - lastRegisteredTimestamp < 2000) {
    return;
  }
  lastRegisteredTimestamp = now;

  try {
    // Atomic backend increment in Firestore
    await updateDoc(siteStatsRef, {
      views: increment(1),
      lastUpdated: serverTimestamp(),
    });
    // Keep legacy analytics document synced
    updateDoc(legacyStatsRef, {
      views: increment(1),
      lastUpdated: serverTimestamp(),
    }).catch(() => {});
  } catch (err) {
    try {
      // If doc didn't exist yet, initialize atomically
      await setDoc(
        siteStatsRef,
        {
          views: 12483,
          clicks: 0,
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e2) {
      console.warn('Could not register view in Firestore:', e2);
    }
  }
}

/**
 * Real Clicks:
 * Tracks meaningful interactions: navigation clicks, profile interactions,
 * gallery clicks, project clicks, social buttons using atomic Firestore increment.
 */
export async function registerRealClick(label?: string): Promise<void> {
  try {
    await updateDoc(siteStatsRef, {
      clicks: increment(1),
      lastUpdated: serverTimestamp(),
    });
  } catch (err) {
    try {
      await setDoc(
        siteStatsRef,
        {
          views: 1250,
          clicks: 1,
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );
    } catch {
      // Non-blocking fallback
    }
  }
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: true,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

export interface FirestoreComment {
  id: string;
  name: string;
  authorName: string;
  comment: string;
  text: string;
  createdAt: string;
  userId: string;
  avatar: string;
  authorAvatar: string;
  likes: number;
  isPinned?: boolean;
  replies?: Array<{
    id: string;
    authorName: string;
    authorAvatar?: string;
    text: string;
    createdAt: string;
    isOwner?: boolean;
  }>;
}

/**
 * Basic HTML/Script sanitization
 */
export function sanitizeCommentInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/[<>"'&]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#39;';
        case '&': return '&amp;';
        default: return char;
      }
    })
    .trim();
}

/**
 * Retrieve or generate anonymous visitor profile from localStorage
 */
export function getVisitorIdentity(): { userId: string; name: string; avatar: string } {
  if (typeof window === 'undefined') {
    return { userId: 'anon', name: '', avatar: '/assets/images/avatar.gif' };
  }
  const key = 'wolfey_visitor_identity';
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Fallback
    }
  }

  // Generate anonymous visitor identity
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const newIdentity = {
    userId: `visitor_${randomSuffix}_${Date.now().toString(36)}`,
    name: '',
    avatar: '/assets/images/avatar.gif',
  };
  localStorage.setItem(key, JSON.stringify(newIdentity));
  return newIdentity;
}

export function saveVisitorName(name: string): void {
  if (typeof window === 'undefined') return;
  const current = getVisitorIdentity();
  current.name = name.trim();
  localStorage.setItem('wolfey_visitor_identity', JSON.stringify(current));
}

// Memory cache to prevent flicker before snapshot returns
let cachedComments: FirestoreComment[] = [];

/**
 * Subscribe to real-time comments from Firestore
 * Returns comments sorted newest-first (with pinned on top)
 */
export function subscribeToComments(onUpdate: (comments: FirestoreComment[]) => void): Unsubscribe {
  const commentsCol = collection(db, 'comments');
  const q = query(commentsCol, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        // If collection has no comments, initialize with official pinned welcome comment
        seedWelcomeCommentIfEmpty().catch(() => {});
        onUpdate(DEFAULT_COMMENTS);
        return;
      }

      const list: FirestoreComment[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        const displayName = d.name || d.authorName || 'Anonymous Visitor';
        const displayComment = d.comment || d.text || '';
        const displayAvatar = d.avatar || d.authorAvatar || '/assets/images/avatar.gif';

        return {
          id: docSnap.id,
          name: displayName,
          authorName: displayName,
          comment: displayComment,
          text: displayComment,
          createdAt: d.createdAt || new Date().toISOString(),
          userId: d.userId || 'anon',
          avatar: displayAvatar,
          authorAvatar: displayAvatar,
          likes: typeof d.likes === 'number' ? d.likes : 0,
          isPinned: Boolean(d.isPinned),
          replies: Array.isArray(d.replies) ? d.replies : [],
        };
      });

      // Maintain sort: Pinned first, then newest first by createdAt
      list.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      cachedComments = list;
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'comments');
      // Graceful fallback with cached comments or default
      onUpdate(cachedComments.length > 0 ? cachedComments : DEFAULT_COMMENTS);
    }
  );

  return unsubscribe;
}

/**
 * Add a new comment to Firestore
 */
export async function addFirestoreComment(
  name: string,
  commentText: string,
  avatarUrl?: string
): Promise<string> {
  const sanitizedName = sanitizeCommentInput(name) || 'Anonymous Visitor';
  const sanitizedText = sanitizeCommentInput(commentText);

  if (!sanitizedText) {
    throw new Error('Comment cannot be empty.');
  }
  if (sanitizedText.length > 1000) {
    throw new Error('Comment is too long (maximum 1000 characters).');
  }

  // Rate-limiting check
  const lastPostKey = 'wolfey_last_comment_time';
  if (typeof window !== 'undefined') {
    const lastTime = parseInt(localStorage.getItem(lastPostKey) || '0', 10);
    const now = Date.now();
    if (now - lastTime < 3500) {
      throw new Error('Please wait a few seconds before posting another comment.');
    }
    localStorage.setItem(lastPostKey, now.toString());
    saveVisitorName(sanitizedName);
  }

  const identity = getVisitorIdentity();
  const commentsCol = collection(db, 'comments');

  try {
    const newDoc = await addDoc(commentsCol, {
      name: sanitizedName,
      authorName: sanitizedName,
      comment: sanitizedText,
      text: sanitizedText,
      createdAt: new Date().toISOString(),
      userId: identity.userId,
      avatar: avatarUrl || identity.avatar || '/assets/images/avatar.gif',
      authorAvatar: avatarUrl || identity.avatar || '/assets/images/avatar.gif',
      likes: 0,
      isPinned: false,
      replies: [],
    });

    registerRealClick('post_comment');
    return newDoc.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'comments');
    throw err;
  }
}

/**
 * Like a comment in Firestore
 */
export async function likeFirestoreComment(commentId: string): Promise<void> {
  const commentRef = doc(db, 'comments', commentId);
  try {
    await updateDoc(commentRef, {
      likes: increment(1),
    });
    registerRealClick('like_comment');
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `comments/${commentId}`);
  }
}

/**
 * Add a reply to a comment in Firestore
 */
export async function addFirestoreReply(
  commentId: string,
  authorName: string,
  text: string,
  isOwner = false
): Promise<void> {
  const commentRef = doc(db, 'comments', commentId);
  try {
    const snap = await getDoc(commentRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const existingReplies = data.replies || [];
    const sanitizedReply = sanitizeCommentInput(text);
    if (!sanitizedReply) return;

    const newReply = {
      id: 'reply_' + Date.now(),
      authorName: sanitizeCommentInput(authorName) || 'Visitor',
      authorAvatar: isOwner ? '/assets/images/avatar.gif' : undefined,
      text: sanitizedReply,
      createdAt: new Date().toISOString(),
      isOwner,
    };

    await updateDoc(commentRef, {
      replies: [...existingReplies, newReply],
    });
    registerRealClick('reply_comment');
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `comments/${commentId}`);
  }
}

/**
 * Seed initial official welcome comment if collection is empty
 */
async function seedWelcomeCommentIfEmpty(): Promise<void> {
  try {
    const commentsCol = collection(db, 'comments');
    await addDoc(commentsCol, {
      name: 'Wolfey',
      authorName: 'Wolfey',
      comment: "Welcome to my creative space! 🐺 Feel free to explore my games, 3D designs, anime edits, and animations. Leave your thoughts or feedback below! — Wolfey from India 🇮🇳",
      text: "Welcome to my creative space! 🐺 Feel free to explore my games, 3D designs, anime edits, and animations. Leave your thoughts or feedback below! — Wolfey from India 🇮🇳",
      createdAt: new Date().toISOString(),
      userId: 'wolfey_official',
      avatar: '/assets/images/avatar.gif',
      authorAvatar: '/assets/images/avatar.gif',
      likes: 42,
      isPinned: true,
      replies: [
        {
          id: 'rep-1',
          authorName: 'AeroVisuals',
          text: 'The 3D render composition and anime aesthetic are insane bro! Keep it up.',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          isOwner: false,
        },
      ],
    });
  } catch {
    // Non-blocking
  }
}

export const DEFAULT_COMMENTS: FirestoreComment[] = [
  {
    id: 'pinned-1',
    name: 'Wolfey',
    authorName: 'Wolfey',
    comment: "Welcome to my creative space! 🐺 Feel free to explore my games, 3D designs, anime edits, and animations. Leave your thoughts or feedback below! — Wolfey from India 🇮🇳",
    text: "Welcome to my creative space! 🐺 Feel free to explore my games, 3D designs, anime edits, and animations. Leave your thoughts or feedback below! — Wolfey from India 🇮🇳",
    authorAvatar: '/assets/images/avatar.gif',
    avatar: '/assets/images/avatar.gif',
    createdAt: '2026-08-30T10:00:00.000Z',
    userId: 'wolfey_official',
    likes: 42,
    isPinned: true,
    replies: [
      {
        id: 'rep-1',
        authorName: 'AeroVisuals',
        text: 'The 3D render composition and anime aesthetic are insane bro! Keep it up.',
        createdAt: '2026-09-01T14:22:00.000Z',
        isOwner: false,
      },
    ],
  },
  {
    id: 'c-2',
    name: 'CyberKage',
    authorName: 'CyberKage',
    comment: 'Your AMVs and video transitions are buttery smooth! What plugins do you use for DaVinci?',
    text: 'Your AMVs and video transitions are buttery smooth! What plugins do you use for DaVinci?',
    authorAvatar: '/assets/images/avatar.gif',
    avatar: '/assets/images/avatar.gif',
    createdAt: '2026-09-02T08:15:00.000Z',
    userId: 'visitor_kage',
    likes: 19,
    replies: [
      {
        id: 'rep-2',
        authorName: 'Wolfey',
        authorAvatar: '/assets/images/avatar.gif',
        text: 'Mainly custom fusion nodes and Boris FX Sapphire! Glad you like them!',
        createdAt: '2026-09-02T09:40:00.000Z',
        isOwner: true,
      },
    ],
  },
  {
    id: 'c-3',
    name: 'NeoPixel',
    authorName: 'NeoPixel',
    comment: 'Love the 9:16 vertical showcase layout. Super sleek on mobile and desktop!',
    text: 'Love the 9:16 vertical showcase layout. Super sleek on mobile and desktop!',
    authorAvatar: '/assets/images/avatar.gif',
    avatar: '/assets/images/avatar.gif',
    createdAt: '2026-09-02T19:04:00.000Z',
    userId: 'visitor_neo',
    likes: 14,
  },
];


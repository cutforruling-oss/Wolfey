import React, { useState, useEffect } from 'react';
import {
  FirestoreComment,
  subscribeToComments,
  addFirestoreComment,
  likeFirestoreComment,
  addFirestoreReply,
  getVisitorIdentity,
} from '../../lib/firebase';
import { Pin, Heart, Send, CornerDownRight, MessageSquare, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playSfx } from '../../lib/soundManager';

interface CommentsTabProps {
  onCommentCountChange?: (count: number) => void;
}

export const CommentsTab: React.FC<CommentsTabProps> = ({ onCommentCountChange }) => {
  const [comments, setComments] = useState<FirestoreComment[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [newText, setNewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('');
  const [likedMap, setLikedMap] = useState<{ [id: string]: boolean }>({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize with visitor identity
  useEffect(() => {
    const identity = getVisitorIdentity();
    if (identity.name) {
      setAuthorName(identity.name);
    }

    const unsub = subscribeToComments((data) => {
      setComments(data);
      if (onCommentCountChange) {
        let total = data.length;
        data.forEach((c) => {
          if (c.replies) total += c.replies.length;
        });
        onCommentCountChange(total);
      }
    });

    // Load liked comments from localStorage to prevent duplicate client clicks
    const stored = localStorage.getItem('wolfey_liked_comments');
    if (stored) {
      try {
        setLikedMap(JSON.parse(stored));
      } catch {}
    }

    return () => unsub();
  }, [onCommentCountChange]);

  const handleToggleLike = async (commentId: string) => {
    if (likedMap[commentId]) return; // already liked in this browser session
    playSfx('comments');

    const updated = { ...likedMap, [commentId]: true };
    setLikedMap(updated);
    try {
      localStorage.setItem('wolfey_liked_comments', JSON.stringify(updated));
      await likeFirestoreComment(commentId);
    } catch (err) {
      console.warn('Like comment failed:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || isSubmitting) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      playSfx('comments');
      await addFirestoreComment(authorName, newText);
      setNewText('');
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 4000);
    } catch (err: any) {
      console.error('Error posting comment:', err);
      setErrorMessage(err?.message || 'Unable to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async (commentId: string) => {
    if (!replyText.trim()) return;
    try {
      playSfx('comments');
      await addFirestoreReply(commentId, replyAuthor || 'Visitor', replyText);
      setReplyText('');
      setReplyingToId(null);
    } catch (err) {
      console.error('Error replying:', err);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div id="comments-tab-content" className="flex flex-col gap-4 text-left py-2">
      {/* Anime Submission Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-gradient-to-r from-sky-950/90 via-cyan-900/80 to-slate-950/90 border border-cyan-400/50 shadow-[0_0_25px_rgba(56,189,248,0.35)] text-cyan-200 text-xs font-semibold"
          >
            <div className="w-5 h-5 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-300">
              <CheckCircle2 size={14} className="text-cyan-400 animate-pulse" />
            </div>
            <span>COMMENT POSTED TO DATABASE & SAVED PERMANENTLY!</span>
            <CheckCircle2 size={14} className="text-emerald-400 ml-auto" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs">
          {errorMessage}
        </div>
      )}

      {/* Leave a Comment Form */}
      <form
        onSubmit={handleAddComment}
        className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md flex flex-col gap-3 shadow-lg"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-300 uppercase tracking-wider">
          <MessageSquare size={14} />
          <span>Leave a Message for Wolfey</span>
        </div>

        <input
          type="text"
          placeholder="Your Name"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          maxLength={40}
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-sky-400/50"
        />

        <div className="relative">
          <textarea
            placeholder="Write something about Wolfey's website..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            rows={3}
            maxLength={600}
            required
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-sky-400/50 resize-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-stone-400">
            {newText.length}/600 chars
          </span>
          <button
            type="submit"
            disabled={!newText.trim() || isSubmitting}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider cursor-pointer uppercase transition-all duration-200 shadow-md ${
              newText.trim() && !isSubmitting
                ? 'bg-gradient-to-r from-sky-400 to-cyan-300 text-black hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                : 'bg-white/10 text-stone-500 cursor-not-allowed'
            }`}
          >
            <span>{isSubmitting ? 'POSTING...' : 'POST COMMENT'}</span>
            <Send size={13} />
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="flex flex-col gap-3">
        {comments.map((comment) => {
          const isLiked = !!likedMap[comment.id];
          const displayName = comment.name || comment.authorName || 'Visitor';
          const displayComment = comment.comment || comment.text || '';
          const displayAvatar = comment.avatar || comment.authorAvatar || '/assets/images/avatar.gif';

          return (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`p-4 rounded-2xl border backdrop-blur-md transition-all flex flex-col gap-2.5 hover:border-sky-400/30 ${
                comment.isPinned
                  ? 'bg-sky-950/25 border-sky-400/35 shadow-[0_0_20px_rgba(56,189,248,0.15)]'
                  : 'bg-black/40 border-white/10'
              }`}
            >
              {/* Header: Author + Pin/Date */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={displayAvatar}
                    alt={displayName}
                    loading="lazy"
                    decoding="async"
                    className="w-7 h-7 rounded-full object-cover border border-white/20"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">
                        {displayName}
                      </span>
                      {comment.isPinned && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-sky-400/20 text-sky-200 border border-sky-400/30">
                          <Pin size={9} />
                          Owner
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono block">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Like Button */}
                <button
                  onClick={() => handleToggleLike(comment.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    isLiked
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-white/5 text-stone-400 hover:text-white border border-white/5'
                  }`}
                >
                  <Heart
                    size={13}
                    className={isLiked ? 'fill-rose-400 text-rose-400' : ''}
                  />
                  <span>{comment.likes || 0}</span>
                </button>
              </div>

              {/* Text */}
              <p className="text-xs text-stone-200 leading-relaxed pl-9">
                {displayComment}
              </p>

              {/* Reply Trigger */}
              <div className="pl-9 flex items-center gap-3 pt-1">
                <button
                  onClick={() =>
                    setReplyingToId(replyingToId === comment.id ? null : comment.id)
                  }
                  className="text-[11px] text-sky-300 hover:text-sky-200 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <CornerDownRight size={12} />
                  <span>Reply</span>
                </button>
              </div>

              {/* Reply Input Box */}
              {replyingToId === comment.id && (
                <div className="ml-9 p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={replyAuthor}
                    onChange={(e) => setReplyAuthor(e.target.value)}
                    maxLength={30}
                    className="w-full px-2.5 py-1 rounded bg-black/40 border border-white/10 text-xs text-white placeholder-stone-400 focus:outline-none"
                  />
                  <textarea
                    placeholder={`Reply to ${displayName}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={2}
                    maxLength={200}
                    className="w-full px-2.5 py-1.5 rounded bg-black/40 border border-white/10 text-xs text-white placeholder-stone-400 focus:outline-none resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setReplyingToId(null)}
                      className="text-xs px-2.5 py-1 text-stone-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSendReply(comment.id)}
                      disabled={!replyText.trim()}
                      className="text-xs px-3 py-1 bg-sky-500 text-black font-semibold rounded cursor-pointer disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}

              {/* Threaded Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-9 mt-1 pl-3 border-l-2 border-sky-400/20 flex flex-col gap-2">
                  {comment.replies.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-white">
                            {rep.authorName}
                          </span>
                          {rep.isOwner && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-sky-400/20 text-sky-200 border border-sky-400/30">
                              Owner
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-stone-400 font-mono">
                          {formatDate(rep.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-300 leading-relaxed">
                        {rep.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};


import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { playSfx } from '../lib/soundManager';

interface AnimatedScrollContainerProps {
  children: React.ReactNode;
  maxHeightClass?: string;
  className?: string;
}

export const AnimatedScrollContainer: React.FC<AnimatedScrollContainerProps> = ({
  children,
  maxHeightClass = 'max-h-[540px] sm:max-h-[620px]',
  className = '',
}) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [thumbHeight, setThumbHeight] = useState(48);
  const [thumbTop, setThumbTop] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 100%
  const [hasScrollableContent, setHasScrollableContent] = useState(true);

  const dragStartRef = useRef<{ startY: number; startScrollTop: number }>({
    startY: 0,
    startScrollTop: 0,
  });

  // Calculate thumb size & position based on current scroll state
  const updateScrollbar = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const { scrollTop, scrollHeight, clientHeight } = viewport;
    const trackHeight = track.clientHeight;

    if (scrollHeight <= clientHeight || trackHeight <= 0) {
      setHasScrollableContent(false);
      setThumbTop(0);
      setScrollProgress(0);
      return;
    }

    setHasScrollableContent(true);

    // Calculate proportional thumb height (min 36px, max 80% of track)
    const ratio = clientHeight / scrollHeight;
    const computedThumbHeight = Math.max(36, Math.min(trackHeight * ratio, trackHeight - 20));
    setThumbHeight(computedThumbHeight);

    // Calculate thumb top position
    const maxScroll = scrollHeight - clientHeight;
    const maxThumbTop = trackHeight - computedThumbHeight;
    const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
    const computedTop = progress * maxThumbTop;

    setThumbTop(computedTop);
    setScrollProgress(Math.round(progress * 100));
  }, []);

  const rafRef = useRef<number | null>(null);
  const lastSfxRef = useRef<number>(0);

  // Update on scroll with rAF scheduling and throttled sound to eliminate jank
  const handleScroll = useCallback(() => {
    const now = Date.now();
    if (now - lastSfxRef.current > 500) {
      lastSfxRef.current = now;
      playSfx('scroll');
    }
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      updateScrollbar();
    });
  }, [updateScrollbar]);

  // Re-measure when children resize or window resizes
  useEffect(() => {
    updateScrollbar();

    const viewport = viewportRef.current;
    if (!viewport) return;

    const resizeObserver = new ResizeObserver(() => {
      updateScrollbar();
    });

    resizeObserver.observe(viewport);
    if (viewport.firstElementChild) {
      resizeObserver.observe(viewport.firstElementChild);
    }

    window.addEventListener('resize', updateScrollbar, { passive: true });

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScrollbar);
    };
  }, [updateScrollbar]);

  // Pointer drag logic for thumb
  const handleThumbPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const viewport = viewportRef.current;
    if (!viewport) return;

    setIsDragging(true);
    dragStartRef.current = {
      startY: e.clientY,
      startScrollTop: viewport.scrollTop,
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleThumbPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();

    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const trackHeight = track.clientHeight;
    const maxThumbTop = trackHeight - thumbHeight;
    if (maxThumbTop <= 0) return;

    const deltaY = e.clientY - dragStartRef.current.startY;
    const { scrollHeight, clientHeight } = viewport;
    const maxScroll = scrollHeight - clientHeight;

    const scrollDelta = (deltaY / maxThumbTop) * maxScroll;
    viewport.scrollTop = dragStartRef.current.startScrollTop + scrollDelta;
  };

  const handleThumbPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if already released
    }
  };

  // Click anywhere on track to jump scroll
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    const rect = track.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const trackHeight = track.clientHeight;
    const targetThumbCenter = clickY - thumbHeight / 2;
    const maxThumbTop = trackHeight - thumbHeight;

    if (maxThumbTop <= 0) return;

    const progress = Math.max(0, Math.min(1, targetThumbCenter / maxThumbTop));
    const maxScroll = viewport.scrollHeight - viewport.clientHeight;
    viewport.scrollTo({
      top: progress * maxScroll,
      behavior: 'smooth',
    });
  };

  // Quick incremental step buttons
  const scrollUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!viewportRef.current) return;
    viewportRef.current.scrollBy({ top: -140, behavior: 'smooth' });
  };

  const scrollDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!viewportRef.current) return;
    viewportRef.current.scrollBy({ top: 140, behavior: 'smooth' });
  };

  return (
    <div className={`relative flex items-stretch w-full ${className}`}>
      {/* Content Viewport with default scrollbar hidden */}
      <div
        ref={viewportRef}
        onScroll={handleScroll}
        className={`w-full overflow-y-auto pr-3 sm:pr-4 select-text ${maxHeightClass} [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`}
        tabIndex={0}
      >
        {children}
      </div>

      {/* Animated Custom Scrollbar Track (Only if scrollable or visible) */}
      <div
        className={`flex flex-col items-center justify-between flex-shrink-0 w-3 sm:w-3.5 py-0.5 select-none transition-opacity duration-300 ${
          hasScrollableContent ? 'opacity-100' : 'opacity-30 pointer-events-none'
        }`}
      >
        {/* Step Up Button */}
        <button
          onClick={scrollUp}
          className="cursor-pointer flex items-center justify-center w-3 h-3.5 sm:w-3.5 sm:h-4 rounded-md text-sky-400/80 hover:text-sky-200 hover:bg-sky-400/20 active:scale-90 transition-all mb-1"
          title="Scroll Up"
          aria-label="Scroll Up"
        >
          <ChevronUp size={11} />
        </button>

        {/* Scrollbar Track Bar */}
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="relative flex-1 w-1.5 sm:w-2 rounded-full bg-white/5 border border-white/10 hover:border-sky-400/30 cursor-pointer overflow-hidden transition-colors"
          style={{
            boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.6)',
          }}
        >
          {/* Subtle Cyber Circuit Glow Line */}
          <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none bg-gradient-to-b from-sky-500/10 via-purple-500/5 to-sky-500/10" />

          {/* Animated Glowing Scrollbar Thumb */}
          <div
            onPointerDown={handleThumbPointerDown}
            onPointerMove={handleThumbPointerMove}
            onPointerUp={handleThumbPointerUp}
            onPointerCancel={handleThumbPointerUp}
            style={{
              height: `${thumbHeight}px`,
              transform: `translateY(${thumbTop}px)`,
            }}
            className={`absolute left-0 right-0 rounded-full cursor-grab active:cursor-grabbing transition-transform duration-75 ${
              isDragging
                ? 'bg-gradient-to-b from-cyan-300 via-sky-400 to-purple-400 shadow-[0_0_16px_rgba(56,189,248,0.9)]'
                : 'bg-gradient-to-b from-sky-400 via-cyan-300 to-purple-500 hover:brightness-110 shadow-[0_0_10px_rgba(56,189,248,0.65)]'
            }`}
          >
            {/* Shimmer pulse effect inside the thumb */}
            <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse pointer-events-none" />

            {/* Tactile cyber grip markings in thumb center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-[2px] pointer-events-none">
              <span className="w-1 h-[1.5px] bg-black/50 rounded-full" />
              <span className="w-1 h-[1.5px] bg-black/50 rounded-full" />
            </div>
          </div>
        </div>

        {/* Step Down Button */}
        <button
          onClick={scrollDown}
          className="cursor-pointer flex items-center justify-center w-3 h-3.5 sm:w-3.5 sm:h-4 rounded-md text-sky-400/80 hover:text-sky-200 hover:bg-sky-400/20 active:scale-90 transition-all mt-1"
          title="Scroll Down"
          aria-label="Scroll Down"
        >
          <ChevronDown size={11} />
        </button>

        {/* Mini Percentage Badge on Drag/Hover */}
        {isDragging && (
          <div className="absolute -left-9 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-black/90 border border-sky-400 text-[9px] font-mono text-sky-300 shadow-lg pointer-events-none">
            {scrollProgress}%
          </div>
        )}
      </div>
    </div>
  );
};

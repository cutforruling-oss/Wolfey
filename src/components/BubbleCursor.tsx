import React, { useEffect, useRef } from 'react';
import { getCurrentSettings, subscribePerformance } from '../lib/performanceManager';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  alpha: number;
  decay: number;
  hue: number;
}

export const BubbleCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let settings = getCurrentSettings();
    const unsubPerf = subscribePerformance((_, newSettings) => {
      settings = newSettings;
    });

    // If mobile or performance tier with bubble cursor disabled, skip
    if (!settings.enableBubbleCursor) {
      return () => unsubPerf();
    }

    const canvas = canvasRef.current;
    if (!canvas) return () => unsubPerf();

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return () => unsubPerf();

    let particles: Particle[] = [];
    let animationFrameId: number | null = null;
    let isRunning = false;
    let lastX = 0;
    let lastY = 0;

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    const render = () => {
      if (particles.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        isRunning = false;
        animationFrameId = null;
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        // Shimmering bubble fill with highlight
        ctx.strokeStyle = `hsla(${p.hue}, 90%, 75%, ${p.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.alpha * 0.35})`;
        ctx.fill();

        // Inner specular glint
        ctx.beginPath();
        ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.8})`;
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!settings.enableBubbleCursor) return;

      const distance = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      if (distance > 8) {
        lastX = e.clientX;
        lastY = e.clientY;

        // Spawn 1-2 bubbles
        const count = settings.tier === 'high' ? 2 : 1;
        for (let i = 0; i < count; i++) {
          particles.push({
            x: e.clientX + (Math.random() - 0.5) * 6,
            y: e.clientY + (Math.random() - 0.5) * 6,
            size: Math.random() * 4 + 3,
            speedX: (Math.random() - 0.5) * 0.6,
            speedY: -Math.random() * 1.1 - 0.3,
            alpha: 0.65,
            decay: Math.random() * 0.02 + 0.015,
            hue: 195 + Math.random() * 20,
          });
        }

        // Start render loop only when particles exist
        if (!isRunning) {
          isRunning = true;
          animationFrameId = requestAnimationFrame(render);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleVisibility = () => {
      if (document.hidden) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
          isRunning = false;
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      unsubPerf();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="bubble-cursor-canvas"
      className="fixed inset-0 pointer-events-none z-[70]"
    />
  );
};

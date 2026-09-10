import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';

interface AnimeCinematicTransitionProps {
  onComplete: () => void;
}

export const AnimeCinematicTransition: React.FC<AnimeCinematicTransitionProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const centerX = () => width / 2;
    const centerY = () => height / 2;

    // Anime particles
    const particleCount = 70;
    const particles = Array.from({ length: particleCount }, () => ({
      x: centerX() + (Math.random() - 0.5) * 200,
      y: centerY() + (Math.random() - 0.5) * 200,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      size: Math.random() * 4 + 2,
      color: Math.random() > 0.5 ? '#38bdf8' : Math.random() > 0.3 ? '#f472b6' : '#ffffff',
      alpha: Math.random() * 0.8 + 0.2,
      life: 0,
      maxLife: 50 + Math.random() * 40,
    }));

    const startTime = performance.now();
    const duration = 2400; // 2.4s cinematic sequence

    const render = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      ctx.clearRect(0, 0, width, height);

      const cx = centerX();
      const cy = centerY();

      // Draw Radial Anime Speed Lines
      const lineCount = 48;
      const maxRadius = Math.sqrt(cx * cx + cy * cy);
      const intensity = Math.sin(progress * Math.PI); // Peaks in middle

      ctx.save();
      ctx.lineWidth = 2 + intensity * 3;

      for (let i = 0; i < lineCount; i++) {
        const baseAngle = (i / lineCount) * Math.PI * 2;
        // Jitter angle slightly for anime hand-drawn energy feel
        const angle = baseAngle + (Math.random() - 0.5) * 0.05;
        
        // Inner radius shrinks as speed increases (camera rushing in)
        const innerDist = 60 + (1 - intensity) * 140 + Math.random() * 40;
        const outerDist = innerDist + 120 + intensity * (maxRadius * 0.9);

        const x1 = cx + Math.cos(angle) * innerDist;
        const y1 = cy + Math.sin(angle) * innerDist;
        const x2 = cx + Math.cos(angle) * outerDist;
        const y2 = cy + Math.sin(angle) * outerDist;

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        const lineColor = i % 3 === 0 ? 'rgba(56, 189, 248, ' : i % 3 === 1 ? 'rgba(244, 114, 182, ' : 'rgba(255, 255, 255, ';
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.3, `${lineColor}${0.4 + intensity * 0.5})`);
        grad.addColorStop(1, `${lineColor}${0.8 + intensity * 0.2})`);

        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();

      // Render Light / Pixel Particles rushing outward
      particles.forEach((p) => {
        p.x += p.vx * (1 + intensity * 4);
        p.y += p.vy * (1 + intensity * 4);
        p.life++;

        if (p.life > p.maxLife || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
          p.x = cx + (Math.random() - 0.5) * 60;
          p.y = cy + (Math.random() - 0.5) * 60;
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 12 + 4;
          p.vx = Math.cos(angle) * speed;
          p.vy = Math.sin(angle) * speed;
          p.life = 0;
        }

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = p.alpha * intensity;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (elapsed < duration) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    const timer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div
      id="anime-cinematic-overlay"
      className="fixed inset-0 z-50 pointer-events-none overflow-hidden flex items-center justify-center select-none"
      style={{ backgroundColor: 'rgba(5, 5, 15, 0.92)' }}
    >
      {/* Background Animated Speed Lines Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

      {/* Atmospheric Zoom Vortex */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: [0.95, 1.4, 2.2], opacity: [0, 0.9, 0] }}
        transition={{ duration: 2.3, times: [0, 0.6, 1], ease: 'easeInOut' }}
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none z-15"
        style={{
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, rgba(236, 72, 153, 0.2) 40%, transparent 75%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Central Cyber Anime Frame & Speed Glyphs */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0, letterSpacing: '0.1em' }}
        animate={{
          scale: [0.8, 1.05, 1.3],
          opacity: [0, 1, 1, 0],
          letterSpacing: ['0.1em', '0.25em', '0.45em'],
        }}
        transition={{ duration: 2.2, times: [0, 0.25, 0.8, 1], ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 flex flex-col items-center justify-center text-center px-6"
      >
        {/* Animated Cyber Crosshair / Target */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-4 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 border-2 border-dashed border-sky-400/60 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-3 border border-pink-400/60 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="w-10 h-10 rounded-xl bg-sky-400/20 border border-sky-300 flex items-center justify-center shadow-[0_0_25px_#38bdf8]"
          >
            <Zap size={22} className="text-white fill-sky-300 animate-pulse" />
          </motion.div>
        </div>

        {/* Japanese & English Anime Subtitle */}
        <div className="text-[11px] sm:text-xs font-mono text-pink-400 uppercase tracking-widest mb-1 flex items-center gap-1.5 font-bold">
          <Zap size={13} className="text-pink-300" />
          <span>システム起動 // SYSTEM ENGAGE</span>
          <Zap size={13} className="text-pink-300" />
        </div>

        {/* Big Impact Title */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-200 to-pink-300 filter drop-shadow-[0_0_25px_rgba(56,189,248,0.8)] font-['Plus_Jakarta_Sans']">
          WOLFEY MATRIX
        </h2>

        <p className="text-xs sm:text-sm font-mono text-sky-200/90 mt-2 tracking-widest uppercase">
          ✦ ENTERING CREATIVE UNIVERSE ✦
        </p>
      </motion.div>

      {/* Cinematic White Flash at Exit (Anime Scene Transition) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.85, 0] }}
        transition={{ duration: 2.4, times: [0, 0.75, 0.88, 1], ease: 'easeInOut' }}
        className="absolute inset-0 bg-white pointer-events-none z-30"
      />
    </div>
  );
};

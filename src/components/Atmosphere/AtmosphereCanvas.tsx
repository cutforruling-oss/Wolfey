import React, { useEffect, useRef } from 'react';
import { AtmosphereOption } from '../../types';
import { getCurrentSettings, subscribePerformance, PerformanceSettings } from '../../lib/performanceManager';

interface AtmosphereCanvasProps {
  atmosphere: AtmosphereOption;
  isEntered: boolean;
}

// Particle Definitions
interface SakuraPetal {
  type: 'sakura';
  x: number;
  y: number;
  z: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  pitch: number;
  pitchSpeed: number;
  roll: number;
  rollSpeed: number;
  speedX: number;
  speedY: number;
  swayFreq: number;
  swayAmp: number;
  swayPhase: number;
  opacity: number;
  targetOpacity: number;
  colorVariation: number;
}

interface CyberSpark {
  type: 'cyber';
  x: number;
  y: number;
  z: number;
  size: number;
  speedX: number;
  speedY: number;
  history: { x: number; y: number }[];
  maxHistory: number;
  color: string;
  glowColor: string;
  life: number;
  maxLife: number;
  sparkType: 'line' | 'pixel' | 'arc';
  energyPulse: number;
}

interface SpiritOrb {
  type: 'spirit';
  x: number;
  y: number;
  z: number;
  radius: number;
  baseRadius: number;
  pulseFreq: number;
  pulsePhase: number;
  speedX: number;
  speedY: number;
  floatAngle: number;
  orbitCenter: { x: number; y: number };
  orbitRadius: number;
  orbitSpeed: number;
  orbitAngle: number;
  opacity: number;
  targetOpacity: number;
  color: string;
  glowColor: string;
  trail: { x: number; y: number; opacity: number }[];
}

export const AtmosphereCanvas: React.FC<AtmosphereCanvasProps> = ({
  atmosphere,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const perfSettingsRef = useRef<PerformanceSettings>(getCurrentSettings());
  const stateRef = useRef<{
    currentAtmosphere: AtmosphereOption;
    targetAtmosphere: AtmosphereOption;
    sakuraPetals: SakuraPetal[];
    cyberSparks: CyberSpark[];
    spiritOrbs: SpiritOrb[];
    lastTime: number;
    mouseX: number;
    mouseY: number;
    targetMouseX: number;
    targetMouseY: number;
    windTime: number;
    fadeMultiplier: number;
  }>({
    currentAtmosphere: atmosphere,
    targetAtmosphere: atmosphere,
    sakuraPetals: [],
    cyberSparks: [],
    spiritOrbs: [],
    lastTime: performance.now(),
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    windTime: 0,
    fadeMultiplier: 1,
  });

  // Track atmosphere prop updates with smooth cross-fade
  useEffect(() => {
    stateRef.current.targetAtmosphere = atmosphere;
  }, [atmosphere]);

  useEffect(() => {
    const unsubPerf = subscribePerformance((_, settings) => {
      perfSettingsRef.current = settings;
    });

    const canvas = canvasRef.current;
    if (!canvas) return () => unsubPerf();

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return () => unsubPerf();

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const resize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize, { passive: true });

    // Subtle 3D Mouse Parallax (Extremely subtle, max ~3-4px depth, disabled on mobile)
    const handleMouseMove = (e: MouseEvent) => {
      if (!perfSettingsRef.current.enable3DTilt || perfSettingsRef.current.isMobile) return;
      const centerX = width / 2;
      const centerY = height / 2;
      stateRef.current.targetMouseX = (e.clientX - centerX) / centerX;
      stateRef.current.targetMouseY = (e.clientY - centerY) / centerY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Helper: Initialize Sakura Petal
    const createSakuraPetal = (spawnOffscreen = false): SakuraPetal => {
      const z = Math.random();
      const isMobile = perfSettingsRef.current.isMobile;
      const size = (z * 11 + 7) * (isMobile ? 0.85 : 1);
      return {
        type: 'sakura',
        x: Math.random() * width,
        y: spawnOffscreen ? -30 - Math.random() * 50 : Math.random() * height,
        z,
        size,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        pitch: Math.random() * Math.PI,
        pitchSpeed: (Math.random() - 0.5) * 0.02,
        roll: Math.random() * Math.PI,
        rollSpeed: (Math.random() - 0.5) * 0.03,
        speedX: Math.random() * 0.9 + 0.4 + z * 0.6,
        speedY: Math.random() * 0.8 + 0.5 + z * 0.5,
        swayFreq: Math.random() * 0.03 + 0.015,
        swayAmp: Math.random() * 20 + 10,
        swayPhase: Math.random() * Math.PI * 2,
        opacity: 0,
        targetOpacity: Math.random() * 0.4 + 0.55,
        colorVariation: Math.random(),
      };
    };

    // Helper: Initialize Cyber Spark
    const cyberColors = [
      { base: '#38bdf8', glow: 'rgba(56, 189, 248, 0.6)' },
      { base: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)' },
      { base: '#06b6d4', glow: 'rgba(6, 182, 212, 0.6)' },
      { base: '#ec4899', glow: 'rgba(236, 72, 153, 0.5)' },
    ];

    const createCyberSpark = (): CyberSpark => {
      const colorScheme = cyberColors[Math.floor(Math.random() * cyberColors.length)];
      const types: ('line' | 'pixel' | 'arc')[] = ['line', 'line', 'pixel', 'arc'];
      const z = Math.random();
      const isPerf = perfSettingsRef.current.tier === 'performance';

      return {
        type: 'cyber',
        x: Math.random() * width,
        y: height + Math.random() * 50,
        z,
        size: Math.random() * 2.5 + 1.2,
        speedX: (Math.random() - 0.5) * 1.5,
        speedY: -(Math.random() * 2.5 + 1.8 + z * 1.2),
        history: [],
        maxHistory: isPerf ? 2 : 6,
        color: colorScheme.base,
        glowColor: colorScheme.glow,
        life: 0,
        maxLife: Math.floor(Math.random() * 90 + 70),
        sparkType: types[Math.floor(Math.random() * types.length)],
        energyPulse: Math.random() * Math.PI * 2,
      };
    };

    // Helper: Initialize Spirit Orb
    const spiritColors = [
      { base: '#818cf8', glow: 'rgba(129, 140, 248, 0.5)' },
      { base: '#c084fc', glow: 'rgba(192, 132, 252, 0.5)' },
      { base: '#38bdf8', glow: 'rgba(56, 189, 248, 0.5)' },
      { base: '#f472b6', glow: 'rgba(244, 114, 182, 0.45)' },
    ];

    const createSpiritOrb = (): SpiritOrb => {
      const colorScheme = spiritColors[Math.floor(Math.random() * spiritColors.length)];
      const z = Math.random();
      const baseRadius = (z * 7 + 4) * (perfSettingsRef.current.isMobile ? 0.8 : 1);
      const startX = Math.random() * width;
      const startY = height + Math.random() * 100;

      return {
        type: 'spirit',
        x: startX,
        y: startY,
        z,
        radius: baseRadius,
        baseRadius,
        pulseFreq: Math.random() * 0.03 + 0.02,
        pulsePhase: Math.random() * Math.PI * 2,
        speedX: (Math.random() - 0.5) * 0.6,
        speedY: -(Math.random() * 0.7 + 0.35 + z * 0.4),
        floatAngle: Math.random() * Math.PI * 2,
        orbitCenter: { x: startX, y: startY },
        orbitRadius: Math.random() * 20 + 8,
        orbitSpeed: (Math.random() - 0.5) * 0.025,
        orbitAngle: Math.random() * Math.PI * 2,
        opacity: 0,
        targetOpacity: Math.random() * 0.45 + 0.45,
        color: colorScheme.base,
        glowColor: colorScheme.glow,
        trail: [],
      };
    };

    // Draw single 3D Sakura Petal
    const drawSakuraPetal = (
      c: CanvasRenderingContext2D,
      p: SakuraPetal,
      parallaxX: number,
      parallaxY: number
    ) => {
      c.save();
      const renderX = p.x + parallaxX * (p.z * 3.5);
      const renderY = p.y + parallaxY * (p.z * 3.5);

      c.translate(renderX, renderY);
      c.rotate(p.rotation);

      const scaleX = Math.cos(p.roll);
      const scaleY = Math.cos(p.pitch);
      c.scale(scaleX, scaleY);

      const w = p.size;
      const h = p.size * 1.5;

      c.beginPath();
      c.moveTo(0, -h / 2);
      c.bezierCurveTo(w * 0.8, -h * 0.3, w * 0.8, h * 0.3, 0, h / 2);
      c.bezierCurveTo(-w * 0.8, h * 0.3, -w * 0.8, -h * 0.3, 0, -h / 2);
      c.closePath();

      const alpha = Math.max(0, Math.min(1, p.opacity));
      const pinkShade = p.colorVariation > 0.5 ? '255, 183, 213' : '255, 209, 227';
      c.fillStyle = `rgba(${pinkShade}, ${alpha * 0.78})`;
      c.fill();

      // Only draw petal vein/edge highlights on balanced/high mode
      if (perfSettingsRef.current.tier !== 'performance') {
        c.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
        c.lineWidth = 0.6;
        c.stroke();
      }

      c.restore();
    };

    // Draw Cyber Spark
    const drawCyberSpark = (
      c: CanvasRenderingContext2D,
      s: CyberSpark,
      parallaxX: number,
      parallaxY: number
    ) => {
      c.save();
      const renderX = s.x + parallaxX * (s.z * 3.5);
      const renderY = s.y + parallaxY * (s.z * 3.5);

      const lifeRatio = s.life / s.maxLife;
      const alpha = Math.sin(lifeRatio * Math.PI);

      if (alpha <= 0.01) {
        c.restore();
        return;
      }

      c.globalAlpha = alpha;

      if (s.sparkType === 'line') {
        c.strokeStyle = s.color;
        c.lineWidth = s.size;
        c.beginPath();
        c.moveTo(renderX, renderY);
        c.lineTo(renderX - s.speedX * 3.5, renderY - s.speedY * 3.5);
        c.stroke();
      } else if (s.sparkType === 'pixel') {
        const sSize = s.size * 2.2;
        c.fillStyle = s.color;
        c.fillRect(renderX - sSize / 2, renderY - sSize / 2, sSize, sSize);
      } else if (s.sparkType === 'arc') {
        c.strokeStyle = s.color;
        c.lineWidth = s.size * 0.8;
        c.beginPath();
        c.moveTo(renderX, renderY);
        c.lineTo(renderX + (Math.random() - 0.5) * 8, renderY - 8);
        c.stroke();
      }

      c.restore();
    };

    // Draw Spirit Orb
    const drawSpiritOrb = (
      c: CanvasRenderingContext2D,
      o: SpiritOrb,
      parallaxX: number,
      parallaxY: number
    ) => {
      c.save();
      const renderX = o.x + parallaxX * (o.z * 3.5);
      const renderY = o.y + parallaxY * (o.z * 3.5);

      const breathingRadius = o.baseRadius * (1 + Math.sin(o.pulsePhase) * 0.15);
      const alpha = Math.max(0, Math.min(1, o.opacity));

      if (alpha <= 0.01) {
        c.restore();
        return;
      }

      c.globalAlpha = alpha;
      c.globalCompositeOperation = 'lighter';

      const outerHaloRadius = breathingRadius * (2.2 + o.z * 1.2);

      if (perfSettingsRef.current.tier === 'performance') {
        // Lightweight flat radial fill without multi-stop gradient
        c.fillStyle = o.glowColor;
        c.beginPath();
        c.arc(renderX, renderY, outerHaloRadius, 0, Math.PI * 2);
        c.fill();
      } else {
        const grad = c.createRadialGradient(
          renderX,
          renderY,
          0,
          renderX,
          renderY,
          outerHaloRadius
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, o.color);
        grad.addColorStop(0.8, o.glowColor);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        c.fillStyle = grad;
        c.beginPath();
        c.arc(renderX, renderY, outerHaloRadius, 0, Math.PI * 2);
        c.fill();
      }

      // Bright pulsating core
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(renderX, renderY, breathingRadius * 0.45, 0, Math.PI * 2);
      c.fill();

      c.restore();
    };

    // Main Animation Loop
    const render = (time: number) => {
      const state = stateRef.current;
      const perf = perfSettingsRef.current;

      const target = state.targetAtmosphere;
      const isSakuraActive = target === 'sakura';
      const isCyberActive = target === 'cyber';
      const isSpiritActive = target === 'spirit';
      const isOff = target === 'off';

      // If off and all lists empty, skip frame to save CPU
      if (
        isOff &&
        state.sakuraPetals.length === 0 &&
        state.cyberSparks.length === 0 &&
        state.spiritOrbs.length === 0
      ) {
        ctx.clearRect(0, 0, width, height);
        animId = requestAnimationFrame(render);
        return;
      }

      const dt = Math.min(time - state.lastTime, 64);
      state.lastTime = time;
      state.windTime += dt * 0.001;

      // Mouse parallax lerp
      if (perf.enable3DTilt) {
        state.mouseX += (state.targetMouseX - state.mouseX) * 0.05;
        state.mouseY += (state.targetMouseY - state.mouseY) * 0.05;
      } else {
        state.mouseX = 0;
        state.mouseY = 0;
      }

      // Dynamic Particle Budgets based on Performance Tier
      const SAKURA_COUNT = Math.round(45 * perf.particleMultiplier);
      const CYBER_SPARK_COUNT = Math.round(55 * perf.particleMultiplier);
      const SPIRIT_ORB_COUNT = Math.round(32 * perf.particleMultiplier);

      // Manage Sakura Petals
      if (isSakuraActive) {
        while (state.sakuraPetals.length < SAKURA_COUNT) {
          state.sakuraPetals.push(createSakuraPetal(state.sakuraPetals.length > 0));
        }
      }

      // Manage Cyber Sparks
      if (isCyberActive) {
        while (state.cyberSparks.length < CYBER_SPARK_COUNT) {
          state.cyberSparks.push(createCyberSpark());
        }
      }

      // Manage Spirit Orbs
      if (isSpiritActive) {
        while (state.spiritOrbs.length < SPIRIT_ORB_COUNT) {
          state.spiritOrbs.push(createSpiritOrb());
        }
      }

      ctx.clearRect(0, 0, width, height);

      // 1. UPDATE & DRAW SAKURA PETALS
      for (let i = state.sakuraPetals.length - 1; i >= 0; i--) {
        const p = state.sakuraPetals[i];

        if (!isSakuraActive) {
          p.opacity -= 0.03;
          if (p.opacity <= 0) {
            state.sakuraPetals.splice(i, 1);
            continue;
          }
        } else {
          if (p.opacity < p.targetOpacity) {
            p.opacity = Math.min(p.targetOpacity, p.opacity + 0.02);
          }
        }

        p.rotation += p.rotationSpeed;
        p.pitch += p.pitchSpeed;
        p.roll += p.rollSpeed;

        const windSway = Math.sin(state.windTime * 2 + p.swayPhase) * (p.swayAmp * 0.03);
        const globalBreeze = Math.sin(state.windTime * 0.8) * 0.5 + 0.8;

        p.x += p.speedX * globalBreeze + windSway;
        p.y += p.speedY;

        if (p.y > height + 40) {
          if (isSakuraActive && state.sakuraPetals.length <= SAKURA_COUNT) {
            p.y = -30;
            p.x = Math.random() * (width + 100) - 50;
            p.opacity = 0;
          } else {
            state.sakuraPetals.splice(i, 1);
            continue;
          }
        }
        if (p.x > width + 50) {
          p.x = -40;
        }

        drawSakuraPetal(ctx, p, state.mouseX, state.mouseY);
      }

      // 2. UPDATE & DRAW CYBER SPARKS
      for (let i = state.cyberSparks.length - 1; i >= 0; i--) {
        const s = state.cyberSparks[i];
        s.life += 1;
        s.energyPulse += 0.12;

        s.x += s.speedX;
        s.y += s.speedY;

        if (s.life >= s.maxLife || !isCyberActive) {
          state.cyberSparks.splice(i, 1);
          if (isCyberActive && state.cyberSparks.length < CYBER_SPARK_COUNT) {
            state.cyberSparks.push(createCyberSpark());
          }
          continue;
        }

        drawCyberSpark(ctx, s, state.mouseX, state.mouseY);
      }

      // 3. UPDATE & DRAW SPIRIT ORBS
      for (let i = state.spiritOrbs.length - 1; i >= 0; i--) {
        const o = state.spiritOrbs[i];

        if (!isSpiritActive) {
          o.opacity -= 0.025;
          if (o.opacity <= 0) {
            state.spiritOrbs.splice(i, 1);
            continue;
          }
        } else {
          if (o.opacity < o.targetOpacity) {
            o.opacity = Math.min(o.targetOpacity, o.opacity + 0.015);
          }
        }

        o.pulsePhase += o.pulseFreq;
        o.orbitAngle += o.orbitSpeed;

        o.orbitCenter.x += o.speedX + Math.sin(state.windTime + o.pulsePhase) * 0.3;
        o.orbitCenter.y += o.speedY;

        o.x = o.orbitCenter.x + Math.cos(o.orbitAngle) * o.orbitRadius;
        o.y = o.orbitCenter.y + Math.sin(o.orbitAngle) * (o.orbitRadius * 0.45);

        if (o.y < -50) {
          if (isSpiritActive && state.spiritOrbs.length <= SPIRIT_ORB_COUNT) {
            o.orbitCenter.y = height + 40;
            o.orbitCenter.x = Math.random() * width;
            o.y = height + 40;
            o.opacity = 0;
          } else {
            state.spiritOrbs.splice(i, 1);
            continue;
          }
        }

        drawSpiritOrb(ctx, o, state.mouseX, state.mouseY);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        stateRef.current.lastTime = performance.now();
        animId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      unsubPerf();
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="wolfey-atmosphere-canvas"
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      style={{
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
      aria-hidden="true"
    />
  );
};

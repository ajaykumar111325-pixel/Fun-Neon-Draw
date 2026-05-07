import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Point, NEON_COLORS, TRACING_DATA, LearnCategory } from '../constants';
import { Tool } from '../types';
import { audioService } from '../services/audioService';

interface DrawingCanvasProps {
  color: string;
  size: number;
  tool: Tool;
  isRainbow: boolean;
  history: Point[];
  onAddPoint: (point: Point) => void;
  isReplaying: boolean;
  onReplayFinish: () => void;
  onClear: () => void;
  setCanvasRef: (ref: HTMLCanvasElement | null) => void;
  isLearnMode: boolean;
  learnCategory: LearnCategory;
  learnItem: string;
  isMusicOn: boolean;
  onDrawingStart?: () => void;
  onDrawingEnd?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

interface Firefly {
  x: number;
  y: number;
  angle: number;
  speed: number;
  radius: number;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  color,
  size,
  tool,
  isRainbow,
  history,
  onAddPoint,
  isReplaying,
  onReplayFinish,
  onClear,
  setCanvasRef,
  isLearnMode,
  learnCategory,
  learnItem,
  isMusicOn,
  onDrawingStart,
  onDrawingEnd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const particles = useRef<Particle[]>([]);
  const stars = useRef<Star[]>([]);
  const fireflies = useRef<Firefly[]>([]);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const lastSoundTime = useRef(0);
  const rainbowHue = useRef(0);

  // Initialize Forest Stars and Fireflies
  useEffect(() => {
    const initEffects = () => {
      const newStars: Star[] = [];
      for (let i = 0; i < 50; i++) {
        newStars.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 2 + 1,
          opacity: Math.random(),
          speed: Math.random() * 0.02 + 0.01,
        });
      }
      stars.current = newStars;

      const newFireflies: Firefly[] = [];
      for (let i = 0; i < 15; i++) {
        newFireflies.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 1 + 0.5,
          radius: Math.random() * 2 + 2,
        });
      }
      fireflies.current = newFireflies;
    };
    initEffects();

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
      if (particleCanvasRef.current) {
        particleCanvasRef.current.width = window.innerWidth;
        particleCanvasRef.current.height = window.innerHeight;
      }
      if (backgroundCanvasRef.current) {
        backgroundCanvasRef.current.width = window.innerWidth;
        backgroundCanvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation Loop
  useEffect(() => {
    let animationFrame: number;
    
    const animate = () => {
      const bgCtx = backgroundCanvasRef.current?.getContext('2d');
      const pCtx = particleCanvasRef.current?.getContext('2d');

      if (bgCtx) {
        bgCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        // Forest Background Gradient
        const grad = bgCtx.createRadialGradient(
          window.innerWidth / 2, window.innerHeight, 0,
          window.innerWidth / 2, window.innerHeight, window.innerHeight
        );
        grad.addColorStop(0, '#0a1a0a');
        grad.addColorStop(1, '#050505');
        bgCtx.fillStyle = grad;
        bgCtx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        // Draw stars
        stars.current.forEach((star) => {
          star.opacity += star.speed;
          if (star.opacity > 1 || star.opacity < 0.1) star.speed *= -1;
          bgCtx.beginPath();
          bgCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          bgCtx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
          bgCtx.fill();
        });

        // Draw Tracing Guide
        if (isLearnMode && learnItem) {
          bgCtx.font = `bold ${Math.min(window.innerWidth, window.innerHeight) * 0.6}px Outfit`;
          bgCtx.textAlign = 'center';
          bgCtx.textBaseline = 'middle';
          bgCtx.strokeStyle = 'rgba(57, 255, 20, 0.15)';
          bgCtx.lineWidth = 4;
          bgCtx.setLineDash([20, 10]);
          bgCtx.strokeText(learnItem, window.innerWidth / 2, window.innerHeight / 2);
          bgCtx.setLineDash([]);
        }

        // Draw Fireflies
        fireflies.current.forEach((f) => {
          f.x += Math.cos(f.angle) * f.speed;
          f.y += Math.sin(f.angle) * f.speed;
          f.angle += (Math.random() - 0.5) * 0.1;

          if (f.x < 0) f.x = window.innerWidth;
          if (f.x > window.innerWidth) f.x = 0;
          if (f.y < 0) f.y = window.innerHeight;
          if (f.y > window.innerHeight) f.y = 0;

          const flash = Math.sin(Date.now() / 500) * 0.5 + 0.5;
          bgCtx.beginPath();
          bgCtx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
          bgCtx.fillStyle = `rgba(57, 255, 20, ${flash * 0.4})`;
          bgCtx.shadowBlur = 10;
          bgCtx.shadowColor = '#39ff14';
          bgCtx.fill();
          bgCtx.shadowBlur = 0;
        });
      }

      if (pCtx) {
        pCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        particles.current = particles.current.filter((p) => p.life > 0);
        particles.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 1;
          const alpha = p.life / p.maxLife;
          pCtx.beginPath();
          pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          pCtx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
          pCtx.fill();
        });
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [isLearnMode, learnItem, learnCategory]);

  const createParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 3; i++) {
      particles.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: Math.random() * 3 + 1,
        color,
        life: 30,
        maxLife: 30,
      });
    }
  };

  const drawLine = useCallback((ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = start.color;
    ctx.lineWidth = start.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (start.color === '#000000') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.shadowBlur = start.size;
      ctx.shadowColor = start.color;
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';

    // Play drawing sound with throttling
    const now = performance.now();
    if (now - lastSoundTime.current > 50) {
      if (start.color === '#000000') {
        audioService.playEraserSound();
      } else {
        audioService.playStrokeSound();
      }
      lastSoundTime.current = now;
    }
  }, []);

  // Replay Logic
  useEffect(() => {
    if (!isReplaying) return;
    
    if (history.length > 0) {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      let index = 0;
      const startTime = history[0].timestamp;
      const replayStart = performance.now();

      const runReplay = (now: number) => {
        if (!isReplaying) return;
        const elapsed = now - replayStart;
        while (index < history.length) {
          const point = history[index];
          const pointElapsed = point.timestamp - startTime;
          if (pointElapsed > elapsed) break;
          if (index > 0 && !point.isNewStroke) {
            drawLine(ctx, history[index - 1], point);
          }
          if (point.color !== '#000000') {
            createParticles(point.x, point.y, point.color);
          }
          index++;
        }

        if (index < history.length) {
          requestAnimationFrame(runReplay);
        } else {
          onReplayFinish();
        }
      };
      requestAnimationFrame(runReplay);
    } else {
      onReplayFinish();
    }
  }, [isReplaying, history, drawLine, onReplayFinish]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isReplaying) return;
    setIsDrawing(true);
    onDrawingStart?.();
    if (isMusicOn) audioService.startAmbience();
    const pos = getPos(e);
    lastPoint.current = pos;
    const currentColor = tool === 'eraser' ? '#000000' : (isRainbow ? `hsl(${(rainbowHue.current += 5) % 360}, 100%, 50%)` : color);
    onAddPoint({ ...pos, color: currentColor, size, timestamp: Date.now(), isNewStroke: true });
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isReplaying || !lastPoint.current) return;
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const currentColor = tool === 'eraser' ? '#000000' : (isRainbow ? `hsl(${(rainbowHue.current += 2) % 360}, 100%, 50%)` : color);
    const newPoint: Point = { ...pos, color: currentColor, size, timestamp: Date.now() };
    drawLine(ctx, { ...lastPoint.current, color: currentColor, size, timestamp: 0 }, newPoint);
    if (tool !== 'eraser') createParticles(pos.x, pos.y, currentColor);
    onAddPoint(newPoint);
    lastPoint.current = pos;
  };

  const handleEnd = () => {
    setIsDrawing(false);
    onDrawingEnd?.();
    audioService.stopAmbience();
    lastPoint.current = null;
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const rect = canvas.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  return (
    <div className="relative w-full h-full touch-none overflow-hidden bg-black">
      <canvas ref={backgroundCanvasRef} className="absolute inset-0 z-0 pointer-events-none" />
      <canvas
        ref={(node) => { (canvasRef as any).current = node; setCanvasRef(node); }}
        onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
        onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
        className="absolute inset-0 z-10 cursor-crosshair"
      />
      <canvas ref={particleCanvasRef} className="absolute inset-0 z-20 pointer-events-none" />
    </div>
  );
};

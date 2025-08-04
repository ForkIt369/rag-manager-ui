'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export function MatrixRain({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
    const matrixArray = matrix.split("");

    const fontSize = 10;
    const columns = canvas.width / fontSize;

    const drops: number[] = [];
    for (let x = 0; x < columns; x++) {
      drops[x] = 1;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00FF88';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 35);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "fixed inset-0 pointer-events-none opacity-10 z-0",
        className
      )}
    />
  );
}

export function NeonGlowEffect({ 
  children, 
  color = "cyan",
  intensity = "medium",
  className 
}: { 
  children: React.ReactNode;
  color?: "cyan" | "purple" | "lime" | "pink";
  intensity?: "low" | "medium" | "high";
  className?: string;
}) {
  const colors = {
    cyan: "#00D9FF",
    purple: "#FF00FF",
    lime: "#00FF88",
    pink: "#FF0080"
  };

  const intensities = {
    low: { blur: "10px", opacity: 0.3 },
    medium: { blur: "20px", opacity: 0.5 },
    high: { blur: "30px", opacity: 0.7 }
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: colors[color],
          filter: `blur(${intensities[intensity].blur})`,
          opacity: intensities[intensity].opacity,
        }}
      />
      {children}
    </div>
  );
}

export function CyberGlitchText({ 
  text, 
  className,
  glitchInterval = 3000 
}: { 
  text: string;
  className?: string;
  glitchInterval?: number;
}) {
  const [isGlitching, setIsGlitching] = React.useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, glitchInterval);

    return () => clearInterval(interval);
  }, [glitchInterval]);

  return (
    <span className={cn("relative inline-block", className)} data-text={text}>
      <span className="relative z-10">{text}</span>
      {isGlitching && (
        <>
          <span 
            className="absolute top-0 left-0 text-neon-purple"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
              transform: 'translate(-2px, -2px)',
              animation: 'glitch 0.3s ease-in-out'
            }}
          >
            {text}
          </span>
          <span 
            className="absolute top-0 left-0 text-neon-lime"
            style={{
              clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)',
              transform: 'translate(2px, 2px)',
              animation: 'glitch 0.3s ease-in-out reverse'
            }}
          >
            {text}
          </span>
        </>
      )}
    </span>
  );
}

export function HolographicCard({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    };

    card.addEventListener('mousemove', handleMouseMove);
    return () => card.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative overflow-hidden rounded-lg border border-primary/30",
        "bg-gradient-to-br from-black/90 via-black/80 to-black/90",
        "before:absolute before:inset-0 before:opacity-0 before:hover:opacity-100",
        "before:bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(0,217,255,0.2),transparent_40%)]",
        "before:transition-opacity before:duration-500",
        "after:absolute after:inset-0 after:rounded-lg",
        "after:bg-gradient-to-r after:from-neon-cyan/20 after:via-neon-purple/20 after:to-neon-lime/20",
        "after:opacity-0 after:hover:opacity-100 after:transition-opacity after:duration-500",
        "hover:border-primary/50 transition-all duration-500",
        className
      )}
      style={{
        '--mouse-x': '50%',
        '--mouse-y': '50%'
      } as React.CSSProperties}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export function PulsingOrb({ 
  size = 100, 
  color = "cyan",
  className 
}: { 
  size?: number;
  color?: "cyan" | "purple" | "lime" | "pink";
  className?: string;
}) {
  const colors = {
    cyan: "#00D9FF",
    purple: "#FF00FF",
    lime: "#00FF88",
    pink: "#FF0080"
  };

  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          background: `radial-gradient(circle, ${colors[color]} 0%, transparent 70%)`,
          filter: 'blur(20px)',
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${colors[color]} 0%, transparent 50%)`,
          animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        }}
      />
    </div>
  );
}

export function CyberButton({
  children,
  onClick,
  variant = "primary",
  size = "default",
  className,
  disabled = false,
  loading = false
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "small" | "default" | "large";
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}) {
  const variants = {
    primary: "from-neon-cyan via-neon-purple to-neon-lime",
    secondary: "from-neon-purple via-neon-pink to-neon-blue",
    danger: "from-red-500 via-red-600 to-red-700",
    ghost: "from-transparent via-transparent to-transparent"
  };

  const sizes = {
    small: "px-3 py-1 text-sm",
    default: "px-4 py-2",
    large: "px-6 py-3 text-lg"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "relative overflow-hidden rounded-lg font-medium transition-all duration-300",
        "hover:scale-[1.02] active:scale-[0.98]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        sizes[size],
        className
      )}
    >
      {/* Gradient border */}
      <div className={cn(
        "absolute inset-0 rounded-lg bg-gradient-to-r p-[2px]",
        variants[variant]
      )}>
        <div className="h-full w-full rounded-[calc(0.5rem-2px)] bg-black/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </div>

      {/* Hover effect */}
      <div className={cn(
        "absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300",
        "bg-gradient-to-r",
        variants[variant]
      )} style={{ filter: 'blur(10px)' }} />
    </button>
  );
}

export function FloatingParticles() {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 bg-neon-cyan rounded-full animate-float';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (Math.random() * 20 + 10) + 's';
      particle.style.animationDelay = Math.random() * 5 + 's';
      container.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 30000);
    };

    const interval = setInterval(createParticle, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={particlesRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
    />
  );
}

export function ScanlineEffect({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "fixed inset-0 pointer-events-none z-50 opacity-[0.03]",
        className
      )}
      style={{
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0, 217, 255, 0.1) 2px,
          rgba(0, 217, 255, 0.1) 4px
        )`,
        animation: 'scanline 8s linear infinite'
      }}
    />
  );
}
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function CyberSpinner({ 
  size = "default",
  className 
}: { 
  size?: "small" | "default" | "large";
  className?: string;
}) {
  const sizes = {
    small: "w-8 h-8",
    default: "w-12 h-12",
    large: "w-16 h-16"
  };

  return (
    <div className={cn("relative", sizes[size], className)}>
      <div className="absolute inset-0 rounded-full border-2 border-neon-cyan/20" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-neon-cyan animate-spin" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-r-neon-purple animate-spin-slow" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-b-neon-lime animate-spin-reverse" />
    </div>
  );
}

export function DNAHelix({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-32 h-32", className)}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="dna-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D9FF" />
            <stop offset="50%" stopColor="#FF00FF" />
            <stop offset="100%" stopColor="#00FF88" />
          </linearGradient>
        </defs>
        {[...Array(8)].map((_, i) => (
          <g key={i} transform={`translate(50, ${12.5 * i + 6.25})`}>
            <circle
              cx={Math.sin((i * Math.PI) / 4) * 20}
              cy="0"
              r="3"
              fill="url(#dna-gradient)"
              opacity={0.8}
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
            <circle
              cx={-Math.sin((i * Math.PI) / 4) * 20}
              cy="0"
              r="3"
              fill="url(#dna-gradient)"
              opacity={0.8}
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.1 + 0.5}s` }}
            />
            <line
              x1={Math.sin((i * Math.PI) / 4) * 20}
              y1="0"
              x2={-Math.sin((i * Math.PI) / 4) * 20}
              y2="0"
              stroke="url(#dna-gradient)"
              strokeWidth="1"
              opacity={0.4}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

export function QuantumLoader({ 
  text = "Loading...",
  className 
}: { 
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative w-24 h-24">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-neon-cyan/20 animate-ping" />
        
        {/* Middle rings */}
        <div className="absolute inset-2 rounded-full border-2 border-neon-purple/30 animate-spin" />
        <div className="absolute inset-4 rounded-full border-2 border-neon-lime/40 animate-spin-reverse" />
        
        {/* Core */}
        <div className="absolute inset-6 rounded-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-lime animate-pulse" />
        
        {/* Particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-neon-cyan rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 60}deg) translateX(40px) translateY(-50%)`,
              animation: `orbit 3s linear infinite`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>
      
      <span className="text-neon-cyan font-tech text-sm animate-pulse">
        {text}
      </span>
    </div>
  );
}

export function GlitchLoader({ className }: { className?: string }) {
  const [glitchText, setGlitchText] = React.useState("LOADING");
  
  React.useEffect(() => {
    const texts = ["LOADING", "L0AD1NG", "LO@DING", "LOAD!NG", "L0@D1NG"];
    let index = 0;
    
    const interval = setInterval(() => {
      index = (index + 1) % texts.length;
      setGlitchText(texts[index]);
    }, 200);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className={cn("relative", className)}>
      <div className="text-2xl font-tech font-bold">
        <span className="relative inline-block">
          <span className="text-neon-cyan">{glitchText}</span>
          <span className="absolute top-0 left-0 text-neon-purple" style={{ clipPath: 'inset(0 0 50% 0)' }}>
            {glitchText}
          </span>
          <span className="absolute top-0 left-0 text-neon-lime" style={{ clipPath: 'inset(50% 0 0 0)' }}>
            {glitchText}
          </span>
        </span>
      </div>
      <div className="mt-2 h-1 w-full bg-black/50 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-lime animate-slide" />
      </div>
    </div>
  );
}

export function CyberSkeleton({ 
  className,
  variant = "text"
}: { 
  className?: string;
  variant?: "text" | "card" | "avatar" | "button";
}) {
  const variants = {
    text: "h-4 rounded",
    card: "h-32 rounded-lg",
    avatar: "w-12 h-12 rounded-full",
    button: "h-10 w-24 rounded-lg"
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-black/50",
        variants[variant],
        className
      )}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer"
        style={{
          background: `linear-gradient(
            90deg,
            transparent,
            rgba(0, 217, 255, 0.1),
            rgba(255, 0, 255, 0.1),
            rgba(0, 255, 136, 0.1),
            transparent
          )`
        }}
      />
    </div>
  );
}
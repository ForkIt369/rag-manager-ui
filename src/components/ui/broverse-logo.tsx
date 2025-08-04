'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BroVerseLogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

export function BroVerseLogo({ 
  className, 
  variant = 'full', 
  size = 'md',
  animated = true 
}: BroVerseLogoProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  if (variant === 'icon') {
    return (
      <div className={cn(
        'relative flex items-center justify-center rounded-lg bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-lime p-[2px]',
        iconSizes[size],
        animated && 'animate-cyber-glow',
        className
      )}>
        <div className="flex items-center justify-center w-full h-full bg-background/90 rounded-[calc(0.5rem-2px)] font-tech font-bold">
          <span className={cn(
            'neon-text',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-lg',
            size === 'xl' && 'text-2xl'
          )}>
            BV
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <span 
          className={cn(
            'font-tech font-bold neon-text',
            sizeClasses[size],
            animated && 'glitch-text'
          )}
          data-text="BroVerse"
        >
          BroVerse
        </span>
        <span className={cn(
          'font-cyber font-light text-muted-foreground',
          sizeClasses[size]
        )}>
          RAG
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Icon */}
      <div className={cn(
        'relative flex items-center justify-center rounded-lg bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-lime p-[2px]',
        iconSizes[size],
        animated && 'animate-cyber-glow floating-element'
      )}>
        <div className="flex items-center justify-center w-full h-full bg-background/90 rounded-[calc(0.5rem-2px)] font-tech font-bold">
          <span className={cn(
            'neon-text',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-lg',
            size === 'xl' && 'text-2xl'
          )}>
            BV
          </span>
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span 
            className={cn(
              'font-tech font-bold neon-text leading-none',
              sizeClasses[size],
              animated && 'glitch-text'
            )}
            data-text="BroVerse"
          >
            BroVerse
          </span>
          <span className={cn(
            'font-cyber font-light text-neon-lime leading-none',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-lg',
            size === 'xl' && 'text-2xl'
          )}>
            RAG
          </span>
        </div>
        <span className={cn(
          'font-cyber text-muted-foreground leading-none mt-0.5',
          size === 'sm' && 'text-[10px]',
          size === 'md' && 'text-xs',
          size === 'lg' && 'text-sm',
          size === 'xl' && 'text-base'
        )}>
          The Ultimate Knowledge Intelligence Platform
        </span>
      </div>
    </div>
  );
}

// Matrix rain effect component for background
export function MatrixRain() {
  return (
    <div className="matrix-bg">
      <canvas 
        id="matrix-canvas" 
        className="w-full h-full"
        style={{ 
          background: 'transparent',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      />
    </div>
  );
}

// Cyber particles effect
export function CyberParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-neon-cyan rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={`purple-${i}`}
          className="absolute w-1 h-1 bg-neon-purple rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={`lime-${i}`}
          className="absolute w-1 h-1 bg-neon-lime rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}
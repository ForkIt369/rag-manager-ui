'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  PanelLeftClose, 
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Maximize2,
  Minimize2,
  GripVertical,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SplitViewLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftPanelTitle?: string;
  rightPanelTitle?: string;
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  leftPanelActions?: React.ReactNode;
  rightPanelActions?: React.ReactNode;
  onPanelResize?: (leftWidth: number) => void;
}

export function SplitViewLayout({
  leftPanel,
  rightPanel,
  leftPanelTitle = 'Documents',
  rightPanelTitle = 'Content',
  defaultLeftWidth = 320,
  minLeftWidth = 200,
  maxLeftWidth = 600,
  leftPanelActions,
  rightPanelActions,
  onPanelResize
}: SplitViewLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = leftWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const diff = e.clientX - startXRef.current;
      const newWidth = Math.max(
        minLeftWidth,
        Math.min(maxLeftWidth, startWidthRef.current + diff)
      );
      
      setLeftWidth(newWidth);
      onPanelResize?.(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, minLeftWidth, maxLeftWidth, onPanelResize]);

  const toggleLeftPanel = () => {
    setIsLeftCollapsed(!isLeftCollapsed);
    if (!isLeftCollapsed) {
      setIsRightCollapsed(false);
    }
  };

  const toggleRightPanel = () => {
    setIsRightCollapsed(!isRightCollapsed);
    if (!isRightCollapsed) {
      setIsLeftCollapsed(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const effectiveLeftWidth = isLeftCollapsed ? 0 : (isRightCollapsed ? '100%' : leftWidth);
  const showDivider = !isLeftCollapsed && !isRightCollapsed;

  return (
    <div ref={containerRef} className="flex h-full bg-background relative">
      {/* Left Panel */}
      <div
        className={cn(
          "relative border-r bg-background transition-all duration-300",
          isLeftCollapsed && "border-r-0"
        )}
        style={{ 
          width: effectiveLeftWidth,
          minWidth: isLeftCollapsed ? 0 : minLeftWidth 
        }}
      >
        {!isLeftCollapsed && (
          <>
            <div className="flex items-center justify-between h-14 px-4 border-b">
              <h2 className="font-semibold">{leftPanelTitle}</h2>
              <div className="flex items-center gap-2">
                {leftPanelActions}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleLeftPanel}
                  className="h-8 w-8"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="h-[calc(100%-3.5rem)] overflow-auto">
              {leftPanel}
            </div>
          </>
        )}
      </div>

      {/* Resize Handle */}
      {showDivider && (
        <div
          className={cn(
            "relative w-1 bg-border hover:bg-primary/50 transition-colors cursor-col-resize group",
            isResizing && "bg-primary"
          )}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-primary/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      )}

      {/* Right Panel */}
      <div className={cn(
        "flex-1 relative transition-all duration-300",
        isRightCollapsed && "hidden"
      )}>
        <div className="flex items-center justify-between h-14 px-4 border-b">
          {/* Left side controls */}
          <div className="flex items-center gap-2">
            {isLeftCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLeftPanel}
                className="h-8 w-8"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            )}
            <h2 className="font-semibold">{rightPanelTitle}</h2>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {rightPanelActions}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleRightPanel}
              className="h-8 w-8"
            >
              <PanelRightClose className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="h-8 w-8"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="h-[calc(100%-3.5rem)] overflow-auto">
          {rightPanel}
        </div>
      </div>

      {/* Collapsed Panel Indicators */}
      {isLeftCollapsed && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
          <Button
            variant="default"
            size="sm"
            onClick={toggleLeftPanel}
            className="rounded-l-none"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {isRightCollapsed && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
          <Button
            variant="default"
            size="sm"
            onClick={toggleRightPanel}
            className="rounded-r-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
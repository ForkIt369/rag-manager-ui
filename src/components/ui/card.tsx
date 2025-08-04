import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-primary/20 bg-card/80 backdrop-blur-md text-card-foreground shadow-lg relative overflow-hidden",
      // Add subtle neon glow effect
      "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-neon-cyan/10 before:via-neon-purple/5 before:to-neon-lime/10 before:-z-10",
      // Hover effects
      "hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-tech font-bold leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground via-neon-cyan to-foreground",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

// BroCard - Enhanced card with cyber styling
const BroCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { glowing?: boolean }
>(({ className, glowing = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-primary/30 bg-card/90 backdrop-blur-md text-card-foreground shadow-xl relative overflow-hidden",
      // Cyber glow background
      "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-neon-cyan/15 before:via-neon-purple/10 before:to-neon-lime/15 before:-z-10",
      // Animated border for glowing variant
      glowing && "after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-r after:from-neon-cyan after:via-neon-purple after:to-neon-lime after:p-[2px] after:-z-20 after:animate-cyber-glow",
      glowing && "after:mask-composite:subtract after:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
      // Hover effects
      "hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:scale-[1.02]",
      className
    )}
    {...props}
  />
))
BroCard.displayName = "BroCard"

export { Card, BroCard, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
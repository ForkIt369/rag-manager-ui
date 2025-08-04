import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-cyber font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-lime p-[2px] text-background hover:shadow-lg hover:shadow-primary/25 hover:animate-neon-pulse",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 p-[2px] text-white hover:shadow-lg hover:shadow-red-500/25",
        outline:
          "border border-primary/30 bg-background/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
        secondary:
          "bg-gradient-to-r from-neon-purple to-neon-pink p-[2px] text-background hover:shadow-lg hover:shadow-secondary/25",
        ghost: "hover:bg-primary/10 hover:text-primary hover:shadow-lg hover:shadow-primary/10 backdrop-blur-sm",
        link: "text-primary underline-offset-4 hover:underline hover:text-neon-cyan",
        bro: "bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-lime p-[2px] hover:animate-cyber-glow hover:shadow-2xl hover:shadow-primary/30 transform hover:scale-105",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-4",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // For gradient buttons, we need a wrapper structure
    const isGradientButton = variant === "default" || variant === "bro" || variant === "destructive" || variant === "secondary"
    
    if (isGradientButton) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          <span className="bg-background rounded-[calc(0.5rem-2px)] px-4 py-2 h-full w-full flex items-center justify-center gap-2 font-medium text-foreground">
            {children}
          </span>
        </Comp>
      )
    }
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

// BroButton - A specialized button with enhanced styling
const BroButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "bro", size, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          "relative overflow-hidden bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-lime p-[2px] rounded-lg transition-all duration-300 hover:animate-cyber-glow hover:shadow-2xl hover:shadow-primary/30 transform hover:scale-105",
          size === "sm" && "h-9",
          size === "default" && "h-11",
          size === "lg" && "h-12",
          size === "icon" && "h-11 w-11",
          className
        )}
        ref={ref}
        {...props}
      >
        <span className={cn(
          "bg-background rounded-[calc(0.5rem-2px)] h-full w-full flex items-center justify-center gap-2 font-cyber font-medium text-foreground",
          size === "sm" && "px-4 text-sm",
          size === "default" && "px-6 text-sm",
          size === "lg" && "px-8 text-base",
          size === "icon" && "px-0"
        )}>
          {children}
        </span>
      </button>
    )
  }
)
BroButton.displayName = "BroButton"

export { Button, BroButton, buttonVariants }
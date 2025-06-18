
import { cn } from "@/lib/utils";

// Enhanced animation utilities
export const animations = {
  // Entrance animations
  fadeInUp: "animate-[fadeInUp_0.6s_ease-out_forwards]",
  fadeInDown: "animate-[fadeInDown_0.6s_ease-out_forwards]",
  fadeInLeft: "animate-[fadeInLeft_0.6s_ease-out_forwards]",
  fadeInRight: "animate-[fadeInRight_0.6s_ease-out_forwards]",
  scaleIn: "animate-[scaleIn_0.4s_ease-out_forwards]",
  slideInBottom: "animate-[slideInBottom_0.5s_ease-out_forwards]",
  
  // Interactive animations
  bounceIn: "animate-[bounceIn_0.6s_ease-out_forwards]",
  pulse: "animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]",
  wiggle: "animate-[wiggle_1s_ease-in-out_infinite]",
  
  // Loading animations
  shimmer: "animate-[shimmer_2s_ease-in-out_infinite]",
  wave: "animate-[wave_1.6s_ease-in-out_infinite]",
  
  // Hover animations
  hoverScale: "transition-transform duration-200 hover:scale-105",
  hoverLift: "transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
  hoverGlow: "transition-all duration-300 hover:shadow-xl hover:shadow-primary/25",
};

// Staggered animation helpers
export const getStaggerDelay = (index: number, baseDelay: number = 100): string => {
  return `animation-delay: ${index * baseDelay}ms`;
};

export const createStaggeredElement = (
  children: React.ReactNode,
  index: number,
  animation: keyof typeof animations = "fadeInUp",
  baseDelay: number = 100
) => {
  const style = { animationDelay: `${index * baseDelay}ms` };
  return (
    <div 
      className={cn(animations[animation], "opacity-0")}
      style={style}
    >
      {children}
    </div>
  );
};

// Page transition wrapper
export const PageTransition = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) => (
  <div className={cn("animate-fade-in", className)}>
    {children}
  </div>
);

// Interactive button animations
export const ButtonAnimations = {
  default: "transition-all duration-200 hover:scale-105 active:scale-95",
  soft: "transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
  glow: "transition-all duration-300 hover:shadow-lg hover:shadow-primary/25",
  bounce: "transition-all duration-200 hover:scale-110 active:scale-95",
};

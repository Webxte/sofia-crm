
import { cn } from "@/lib/utils";

export const slideInBottom = "animate-slide-in-bottom";
export const fadeIn = "animate-fade-in";
export const slideInRight = "animate-slide-in-right";

export const getAnimationDelay = (index: number, baseDelay: number = 50): string => {
  return `animation-delay: ${index * baseDelay}ms`;
};

export const getStaggeredClasses = (index: number, baseDelay: number = 50): string => {
  return cn(slideInBottom, `[style*="animation-delay: ${index * baseDelay}ms"]`);
};

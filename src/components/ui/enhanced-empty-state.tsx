
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EnhancedEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
  className?: string;
  animated?: boolean;
  size?: "sm" | "md" | "lg";
}

export const EnhancedEmptyState = ({
  icon,
  title,
  description,
  actionText,
  actionLink,
  onAction,
  className,
  animated = true,
  size = "md"
}: EnhancedEmptyStateProps) => {
  const sizeClasses = {
    sm: "py-8",
    md: "py-12",
    lg: "py-16"
  };

  const iconSizes = {
    sm: "h-12 w-12",
    md: "h-16 w-16", 
    lg: "h-20 w-20"
  };

  const textSizes = {
    sm: { title: "text-lg", description: "text-sm" },
    md: { title: "text-xl", description: "text-base" },
    lg: { title: "text-2xl", description: "text-lg" }
  };

  const ActionButton = () => {
    if (!actionText) return null;

    const buttonContent = (
      <Button 
        size={size === "sm" ? "sm" : "default"}
        className={cn(
          "transition-all duration-200 hover:scale-105 active:scale-95",
          animated && "animate-bounceIn opacity-0"
        )}
        style={animated ? { animationDelay: "0.6s" } : undefined}
      >
        {actionText}
      </Button>
    );

    if (actionLink) {
      return <Link to={actionLink}>{buttonContent}</Link>;
    }

    return <div onClick={onAction}>{buttonContent}</div>;
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center space-y-4",
      sizeClasses[size],
      className
    )}>
      {icon && (
        <div className={cn(
          "text-muted-foreground/60 flex items-center justify-center",
          iconSizes[size],
          animated && "animate-scaleIn opacity-0"
        )} style={animated ? { animationDelay: "0.2s" } : undefined}>
          {icon}
        </div>
      )}
      
      <div className="space-y-2 max-w-md">
        <h3 className={cn(
          "font-semibold text-foreground",
          textSizes[size].title,
          animated && "animate-fadeInUp opacity-0"
        )} style={animated ? { animationDelay: "0.3s" } : undefined}>
          {title}
        </h3>
        
        <p className={cn(
          "text-muted-foreground leading-relaxed",
          textSizes[size].description,
          animated && "animate-fadeInUp opacity-0"
        )} style={animated ? { animationDelay: "0.4s" } : undefined}>
          {description}
        </p>
      </div>

      <ActionButton />
    </div>
  );
};

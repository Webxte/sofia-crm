
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { slideInBottom } from "@/utils/transitions";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  viewAllLink?: string;
  className?: string;
  animationDelay?: number;
}

export const StatCard = ({
  title,
  value,
  icon,
  viewAllLink,
  className,
  animationDelay = 0,
}: StatCardProps) => {
  const animationStyle = animationDelay ? `animation-delay: ${animationDelay}ms` : undefined;

  return (
    <div 
      className={cn(
        "rounded-lg border border-border bg-white p-4 shadow-sm",
        slideInBottom,
        className
      )} 
      style={{ animationStyle }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-1">
            <h3 className="text-3xl font-semibold tracking-tight">{value}</h3>
          </div>
        </div>
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          {icon}
        </div>
      </div>
      {viewAllLink && (
        <div className="mt-4">
          <Link to={viewAllLink} className="text-sm text-primary hover:underline">
            View all →
          </Link>
        </div>
      )}
    </div>
  );
};

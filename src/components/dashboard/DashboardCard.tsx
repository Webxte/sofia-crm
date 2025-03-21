
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { slideInBottom } from "@/utils/transitions";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  viewAllLink?: string;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  animationDelay?: number;
}

export const DashboardCard = ({
  title,
  children,
  viewAllLink,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  animationDelay = 0,
}: DashboardCardProps) => {
  const animationStyle = animationDelay ? { animationDelay: `${animationDelay}ms` } : undefined;

  return (
    <div 
      className={cn(
        "rounded-lg border border-border bg-card shadow-sm overflow-hidden",
        slideInBottom,
        className
      )} 
      style={animationStyle}
    >
      <div className={cn("flex items-center justify-between p-4 border-b border-border", headerClassName)}>
        <h2 className="font-medium">{title}</h2>
        {viewAllLink && (
          <Link to={viewAllLink} className="text-primary text-sm hover:underline flex items-center">
            View all →
          </Link>
        )}
      </div>
      <div className={cn("p-4", contentClassName)}>{children}</div>
      {footerClassName && <div className={cn("p-4 border-t border-border", footerClassName)} />}
    </div>
  );
};


import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { fadeIn } from "@/utils/transitions";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  actionLink?: string;
  actionText?: string;
  actionOnClick?: () => void;
  className?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  actionLink,
  actionText,
  actionOnClick,
  className,
}: EmptyStateProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", fadeIn, className)}>
      <div className="text-muted-foreground mb-4">{icon}</div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      {description && <p className="text-muted-foreground mb-4 max-w-xs mx-auto">{description}</p>}
      
      {(actionLink || actionOnClick) && (
        <div className="mt-2">
          {actionLink ? (
            <Button asChild>
              <Link to={actionLink}>{actionText}</Link>
            </Button>
          ) : (
            <Button onClick={actionOnClick}>{actionText}</Button>
          )}
        </div>
      )}
    </div>
  );
};

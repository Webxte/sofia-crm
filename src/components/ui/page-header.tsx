
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  showBackButton?: boolean;
  backTo?: string;
  className?: string;
  animated?: boolean;
}

export const PageHeader = ({
  title,
  description,
  children,
  showBackButton = false,
  backTo,
  className,
  animated = true
}: PageHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={cn(
      "space-y-4 pb-6 border-b border-border/40",
      animated && "animate-fadeInDown opacity-0",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="hover:bg-muted/50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
          </div>
          {description && (
            <p className="text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className={cn(
            "flex items-center gap-2",
            animated && "animate-fadeInRight opacity-0"
          )} style={{ animationDelay: "0.2s" }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

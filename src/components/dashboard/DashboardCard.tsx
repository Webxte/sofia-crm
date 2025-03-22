
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashboardCardProps {
  title: string;
  viewAllLink: string;
  animationDelay?: number;
  className?: string;
  children: ReactNode;
}

export const DashboardCard = ({
  title,
  viewAllLink,
  animationDelay = 0,
  className = "",
  children,
}: DashboardCardProps) => {
  return (
    <Card className={`overflow-hidden ${className}`}
      style={{
        animationDelay: `${animationDelay}ms`,
      }}
    >
      <CardHeader className="bg-muted/20 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Link to={viewAllLink}>
            <Button
              variant="outline"
              size="sm"
              className="bg-[#0EA5E9] text-white hover:bg-[#0EA5E9]/90 border-[#0EA5E9]"
            >
              View details
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  );
};

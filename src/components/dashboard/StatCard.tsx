
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  viewAllLink: string;
  animationDelay?: number;
}

export const StatCard = ({ 
  title, 
  value, 
  icon, 
  viewAllLink,
  animationDelay = 0,
}: StatCardProps) => {
  return (
    <Link to={viewAllLink} className="block">
      <Card 
        className="hover:shadow-md transition-shadow border-border"
        style={{
          animationDelay: `${animationDelay}ms`,
        }}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                {icon}
              </div>
              <div>
                <h3 className="text-sm font-medium">{title}</h3>
                <span className="text-xl font-bold">{value}</span>
              </div>
            </div>
            <span className="text-primary hover:text-primary/80 transition-colors text-xs flex items-center gap-1">
              View <ArrowRight size={12} />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

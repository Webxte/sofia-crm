
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

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
        className="h-full hover:shadow-md transition-shadow border-border"
        style={{
          animationDelay: `${animationDelay}ms`,
        }}
      >
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-primary/10 rounded-lg">
              {icon}
            </div>
            <span className="text-3xl font-bold">{value}</span>
          </div>
          <h3 className="text-lg font-medium mt-2">{title}</h3>
        </CardContent>
        <CardFooter className="border-t p-3 text-primary hover:text-primary/80 transition-colors">
          <span className="text-sm flex items-center gap-1">
            View all <ArrowRight size={14} />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
};

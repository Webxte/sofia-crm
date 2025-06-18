
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface EnhancedSkeletonProps {
  className?: string;
  count?: number;
  animation?: "pulse" | "wave" | "shimmer";
}

export const EnhancedSkeleton = ({ 
  className, 
  count = 1, 
  animation = "shimmer" 
}: EnhancedSkeletonProps) => {
  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-[wave_1.6s_ease-in-out_infinite]",
    shimmer: "animate-[shimmer_2s_ease-in-out_infinite]"
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton 
          key={i}
          className={cn(
            animationClasses[animation],
            className
          )}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </>
  );
};

export const ContactCardSkeleton = () => (
  <div className="p-4 border rounded-lg space-y-3 animate-fade-in">
    <div className="flex items-center space-x-3">
      <EnhancedSkeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <EnhancedSkeleton className="h-4 w-[140px]" />
        <EnhancedSkeleton className="h-3 w-[100px]" />
      </div>
    </div>
    <div className="space-y-2">
      <EnhancedSkeleton className="h-3 w-full" />
      <EnhancedSkeleton className="h-3 w-[80%]" />
    </div>
    <div className="flex gap-2 pt-2">
      <EnhancedSkeleton className="h-8 w-20" />
      <EnhancedSkeleton className="h-8 w-24" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ columns = 5 }: { columns?: number }) => (
  <tr className="animate-fade-in">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="p-4">
        <EnhancedSkeleton 
          className="h-4 w-full" 
          animation="shimmer"
        />
      </td>
    ))}
  </tr>
);

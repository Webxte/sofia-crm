
import { Skeleton } from "@/components/ui/skeleton";

export const ContactCardSkeleton = () => (
  <div className="border rounded-lg p-4 space-y-3">
    <div className="flex items-center space-x-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    </div>
    <Skeleton className="h-4 w-full" />
    <div className="flex justify-end space-x-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

export const OrderCardSkeleton = () => (
  <div className="border rounded-lg p-4 space-y-3">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <Skeleton className="h-5 w-[180px]" />
        <Skeleton className="h-4 w-[120px]" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
    <Skeleton className="h-4 w-full" />
    <div className="flex justify-between items-center">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

export const MeetingCardSkeleton = () => (
  <div className="border rounded-lg p-4 space-y-3">
    <div className="space-y-2">
      <Skeleton className="h-5 w-[200px]" />
      <Skeleton className="h-4 w-[160px]" />
    </div>
    <Skeleton className="h-16 w-full" />
    <div className="flex justify-end space-x-2">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ columns = 4 }: { columns?: number }) => (
  <tr>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="p-4">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);


import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ContactsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

export const ContactsPagination = ({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  hasNextPage,
  hasPreviousPage,
  onNextPage,
  onPreviousPage,
}: ContactsPaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="flex justify-between flex-1 sm:hidden">
        <Button
          onClick={onPreviousPage}
          disabled={!hasPreviousPage}
          variant="outline"
          size="sm"
        >
          Previous
        </Button>
        <Button
          onClick={onNextPage}
          disabled={!hasNextPage}
          variant="outline"
          size="sm"
        >
          Next
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startIndex}</span> to{' '}
            <span className="font-medium">{endIndex}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={onPreviousPage}
            disabled={!hasPreviousPage}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={onNextPage}
            disabled={!hasNextPage}
            variant="outline"
            size="sm"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

import { useEffect } from 'react';

interface NewRow {
  code: string;
  description: string;
  price: number;
  quantity: number;
  vat: number;
  suggestions: any[];
  showSuggestions: boolean;
  searchTimeout?: NodeJS.Timeout;
}

interface OrderFormCleanupProps {
  newRows: NewRow[];
}

export const useOrderFormCleanup = ({ newRows }: OrderFormCleanupProps) => {
  // Cleanup timeouts when component unmounts or newRows change
  useEffect(() => {
    return () => {
      newRows.forEach(row => {
        if (row.searchTimeout) {
          clearTimeout(row.searchTimeout);
        }
      });
    };
  }, [newRows]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      newRows.forEach(row => {
        if (row.searchTimeout) {
          clearTimeout(row.searchTimeout);
        }
      });
    };
  }, []);
};
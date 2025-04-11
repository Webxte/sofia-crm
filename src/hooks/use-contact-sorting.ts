
import { useState } from "react";

export type SortField = "fullName" | "company" | "email" | "phone" | "source" | "createdAt" | "updatedAt";
export type SortDirection = "asc" | "desc";

export const useContactSorting = () => {
  const [sortField, setSortField] = useState<SortField>("company");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };
  
  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      // If clicking the same field, toggle direction
      toggleSortDirection();
    } else {
      // If clicking a new field, set it as the sort field and reset direction to asc
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return {
    sortField,
    sortDirection,
    setSortField,
    setSortDirection,
    toggleSortDirection,
    handleSortChange
  };
};

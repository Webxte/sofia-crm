import { useState } from "react";
import { Organization } from "@/types";
import { toast } from "sonner";

export const useOrganizationSwitcher = () => {
  const [isLoading, setIsLoading] = useState(false);

  const switchOrganization = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log(`Attempting to switch to organization ${id}`);
      
      // Store the organization ID in localStorage
      localStorage.setItem('currentOrganizationId', id);
      console.log(`Set currentOrganizationId in localStorage: ${id}`);
      
      // Verify the stored ID
      const storedId = localStorage.getItem('currentOrganizationId');
      if (storedId !== id) {
        console.error("Failed to store organization ID in localStorage");
        throw new Error("Failed to store organization ID in localStorage");
      }
      
      return true;
    } catch (error) {
      console.error('Error switching organization:', error);
      toast.error('Error', {
        description: error instanceof Error 
          ? `Failed to switch organization: ${error.message}`
          : 'Failed to switch organization',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    switchOrganization,
    isLoading
  };
};

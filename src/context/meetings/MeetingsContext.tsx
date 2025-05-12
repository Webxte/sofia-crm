
import React, { createContext, useContext, useState, useEffect } from "react";
import { useMeetingsOperations } from "./useMeetingsOperations";
import { Meeting } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { useToast } from "@/hooks/use-toast";

interface MeetingsContextType {
  meetings: Meeting[];
  loading: boolean;
  refreshMeetings: () => Promise<Meeting[]>;
  addMeeting: (meeting: Omit<Meeting, "id" | "createdAt" | "updatedAt">) => Promise<Meeting | null>;
  updateMeeting: (id: string, meeting: Partial<Meeting>) => Promise<boolean>;
  deleteMeeting: (id: string) => Promise<boolean>;
  getMeetingById: (id: string) => Meeting | undefined;
  getMeetingsByContactId: (contactId: string) => Meeting[];
}

const MeetingsContext = createContext<MeetingsContextType | undefined>(undefined);

export const MeetingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { currentOrganization } = useOrganizations();
  const { toast } = useToast();
  const [lastError, setLastError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const {
    meetings,
    loading,
    refreshMeetings: refreshMeetingsOp,
    addMeeting: addMeetingOp,
    updateMeeting,
    deleteMeeting,
    getMeetingById,
    getMeetingsByContactId,
  } = useMeetingsOperations();

  // Fetch meetings when auth state or current organization changes
  useEffect(() => {
    let isMounted = true;
    
    const loadMeetings = async () => {
      if (!isAuthenticated || !user?.id) {
        console.log("User not authenticated, skipping meetings fetch");
        return;
      }

      if (!currentOrganization?.id) {
        console.log("No organization selected, skipping meetings fetch");
        return;
      }
      
      try {
        console.log("MeetingsContext: Fetching meetings...");
        console.log("Current user:", user?.id);
        console.log("Current organization:", currentOrganization?.id);
        
        const result = await refreshMeetingsOp(isAuthenticated);
        
        if (isMounted) {
          if (result && result.length > 0) {
            console.log(`MeetingsContext: Successfully loaded ${result.length} meetings`);
            setLastError(null);
            setRetryCount(0);
          } else {
            console.log("MeetingsContext: No meetings found");
          }
        }
      } catch (error) {
        console.error("Error loading meetings:", error);
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          setLastError(errorMessage);
          
          // Only show toast when retry count is low to avoid spamming
          if (retryCount < 3) {
            toast({
              title: "Error",
              description: "Failed to load meetings. Please try again later.",
              variant: "destructive",
            });
            // Increment retry count to limit toasts
            setRetryCount(prev => prev + 1);
          }
        }
      }
    };
    
    loadMeetings();
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.id, currentOrganization?.id]);

  // Wrapper for addMeeting to include current user
  const addMeeting = async (meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt">) => {
    // Make sure organization ID is set
    if (currentOrganization?.id && !meetingData.organizationId) {
      meetingData.organizationId = currentOrganization.id;
    }
    
    return addMeetingOp(meetingData, user?.id, user?.user_metadata?.name);
  };
  
  // Wrapper for refreshMeetings that handles React state properly
  const refreshMeetingsWrapper = async () => {
    try {
      const result = await refreshMeetingsOp(isAuthenticated);
      if (result && result.length > 0) {
        console.log(`MeetingsContext: Refreshed ${result.length} meetings`);
        setLastError(null);
        setRetryCount(0);
      } else {
        console.log("MeetingsContext: No meetings found during refresh");
      }
      return result;
    } catch (error) {
      console.error("Error refreshing meetings:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setLastError(errorMessage);
      
      toast({
        title: "Error",
        description: "Failed to refresh meetings. Please try again.",
        variant: "destructive",
      });
      
      return [];
    }
  };

  return (
    <MeetingsContext.Provider
      value={{
        meetings,
        loading,
        refreshMeetings: refreshMeetingsWrapper,
        addMeeting,
        updateMeeting,
        deleteMeeting,
        getMeetingById,
        getMeetingsByContactId,
      }}
    >
      {children}
    </MeetingsContext.Provider>
  );
};

export const useMeetings = () => {
  const context = useContext(MeetingsContext);
  if (!context) {
    throw new Error("useMeetings must be used within a MeetingsProvider");
  }
  return context;
};

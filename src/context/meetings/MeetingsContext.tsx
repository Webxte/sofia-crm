
import { createContext, useContext, useEffect, ReactNode } from "react";
import { Meeting } from "@/types";
import { useAuth } from "../AuthContext";
import { useMeetingsOperations } from "./useMeetingsOperations";
import { MeetingsContextType } from "./types";
import { useToast } from "@/hooks/use-toast";

const MeetingsContext = createContext<MeetingsContextType | undefined>(undefined);

export const MeetingsProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const {
    meetings,
    loading,
    refreshMeetings,
    addMeeting: addMeetingOperation,
    updateMeeting,
    deleteMeeting,
    getMeetingById,
    getMeetingsByContactId,
  } = useMeetingsOperations();

  // Fetch meetings when the component mounts or when user auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log("MeetingsContext: User authenticated, fetching meetings");
      refreshMeetings(true).catch(err => {
        console.error("Error during initial meetings fetch:", err);
        toast({
          title: "Error", 
          description: "Failed to load meetings. Please try refreshing.",
          variant: "destructive",
        });
      });
    } else {
      console.log("MeetingsContext: User not authenticated, skipping meetings fetch");
      refreshMeetings(false);
    }
  }, [isAuthenticated, refreshMeetings, toast]);

  // Wrapper for addMeeting to include user data
  const addMeeting = async (meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt">) => {
    if (user) {
      await addMeetingOperation(meetingData, user.id, user.name);
    } else {
      toast({
        title: "Error",
        description: "You must be logged in to add meetings",
        variant: "destructive",
      });
    }
  };

  return (
    <MeetingsContext.Provider
      value={{
        meetings,
        loading,
        addMeeting,
        updateMeeting,
        deleteMeeting,
        getMeetingById,
        getMeetingsByContactId,
        refreshMeetings: () => {
          try {
            return refreshMeetings(isAuthenticated);
          } catch (err) {
            console.error("Error refreshing meetings:", err);
            toast({
              title: "Error",
              description: "Failed to refresh meetings. Please try again.",
              variant: "destructive",
            });
            return Promise.resolve();
          }
        },
      }}
    >
      {children}
    </MeetingsContext.Provider>
  );
};

export const useMeetings = () => {
  const context = useContext(MeetingsContext);
  if (context === undefined) {
    throw new Error("useMeetings must be used within a MeetingsProvider");
  }
  return context;
};

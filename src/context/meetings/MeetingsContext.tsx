
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Meeting } from "@/types";
import { useAuth } from "../AuthContext";
import { useMeetingsOperations } from "./useMeetingsOperations";
import { MeetingsContextType } from "./types";

const MeetingsContext = createContext<MeetingsContextType | undefined>(undefined);

export const MeetingsProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
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
      refreshMeetings(isAuthenticated);
    } else {
      refreshMeetings(false);
    }
  }, [isAuthenticated]);

  // Wrapper for addMeeting to include user data
  const addMeeting = async (meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt">) => {
    if (user) {
      await addMeetingOperation(meetingData, user.id, user.name);
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
        refreshMeetings: () => refreshMeetings(isAuthenticated),
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

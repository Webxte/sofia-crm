
import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useMeetingsOperations } from "./useMeetingsOperations";
import { MeetingsContextType } from "./types";

const MeetingsContext = createContext<MeetingsContextType | undefined>(undefined);

export const MeetingsProvider = ({ children }: { children: ReactNode }) => {
  const operations = useMeetingsOperations();
  
  // Auto-fetch meetings when the provider mounts
  useEffect(() => {
    console.log("MeetingsProvider: Initializing, fetching meetings");
    operations.fetchMeetings();
  }, []);
  
  // Fix the sendMeetingEmail return type to match expected type
  const contextValue: MeetingsContextType = {
    ...operations,
    sendMeetingEmail: async (meetingId: string, emailData: any): Promise<boolean> => {
      try {
        await operations.sendMeetingEmail(meetingId, emailData);
        return true;
      } catch (error) {
        console.error("Error sending meeting email:", error);
        return false;
      }
    }
  };
  
  return (
    <MeetingsContext.Provider value={contextValue}>
      {children}
    </MeetingsContext.Provider>
  );
};

export const useMeetings = (): MeetingsContextType => {
  const context = useContext(MeetingsContext);
  if (context === undefined) {
    throw new Error("useMeetings must be used within a MeetingsProvider");
  }
  return context;
};

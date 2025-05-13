
import React, { createContext, useContext, ReactNode } from "react";
import { useMeetingsOperations } from "./useMeetingsOperations";
import { MeetingsContextType } from "./types";

const MeetingsContext = createContext<MeetingsContextType | undefined>(undefined);

export const MeetingsProvider = ({ children }: { children: ReactNode }) => {
  const operations = useMeetingsOperations();
  
  return (
    <MeetingsContext.Provider value={operations}>
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

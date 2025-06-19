
import React, { ReactNode } from "react";
import { ActualSettingsProvider } from "./ActualSettingsProvider";
import { useAuth } from "../AuthContext";

interface SafeSettingsWrapperProps {
  children: ReactNode;
}

export const SafeSettingsWrapper = ({ children }: SafeSettingsWrapperProps) => {
  // Add safety check to prevent rendering before React is initialized
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.warn("SafeSettingsWrapper: Error getting auth context:", error);
    return <>{children}</>;
  }
  
  // Early return if auth context is not available yet
  if (!authContext) {
    console.warn("SafeSettingsWrapper: Auth context not available yet");
    return <>{children}</>;
  }

  const { isAuthenticated, user, isAdmin } = authContext;
  
  // Add safety check to ensure auth context is properly initialized
  if (typeof isAuthenticated === 'undefined') {
    console.warn("SafeSettingsWrapper: Auth context not yet initialized");
    return <>{children}</>;
  }

  // Now it's safe to render the actual provider with hooks
  return (
    <ActualSettingsProvider 
      isAuthenticated={isAuthenticated} 
      user={user} 
      isAdmin={isAdmin}
    >
      {children}
    </ActualSettingsProvider>
  );
};

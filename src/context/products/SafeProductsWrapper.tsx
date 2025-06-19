
import React, { ReactNode } from "react";
import { ActualProductsProvider } from "./ActualProductsProvider";
import { useAuth } from "../AuthContext";

interface SafeProductsWrapperProps {
  children: ReactNode;
}

export const SafeProductsWrapper = ({ children }: SafeProductsWrapperProps) => {
  // Add safety check to prevent rendering before React is initialized
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.warn("SafeProductsWrapper: Error getting auth context:", error);
    return <>{children}</>;
  }
  
  // Early return if auth context is not available yet
  if (!authContext) {
    console.warn("SafeProductsWrapper: Auth context not available yet");
    return <>{children}</>;
  }

  const { isAuthenticated } = authContext;
  
  // Add safety check to ensure auth context is properly initialized
  if (typeof isAuthenticated === 'undefined') {
    console.warn("SafeProductsWrapper: Auth context not yet initialized");
    return <>{children}</>;
  }

  // Now it's safe to render the actual provider with hooks
  return (
    <ActualProductsProvider isAuthenticated={isAuthenticated}>
      {children}
    </ActualProductsProvider>
  );
};

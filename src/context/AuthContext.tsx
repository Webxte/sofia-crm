
import * as React from "react";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

// Extend the User type to include the name property
interface ExtendedUser extends User {
  name?: string;
  organizationId?: string;
}

interface AuthContextType {
  user: ExtendedUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  createUser: (name: string, email: string, password: string, role: "admin" | "agent") => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state with explicit null values
  const [user, setUser] = React.useState<ExtendedUser | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Helper function to extract user name from metadata
  const getUserWithName = (supabaseUser: User | null): ExtendedUser | null => {
    if (!supabaseUser) return null;
    
    // Get stored organization ID if available
    const storedOrgId = localStorage.getItem('currentOrganizationId');
    
    return {
      ...supabaseUser,
      name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || '',
      organizationId: storedOrgId || undefined
    };
  };

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        const extendedUser = getUserWithName(currentSession?.user ?? null);
        console.log("User with auth change:", extendedUser ? {
          id: extendedUser.id, 
          name: extendedUser.name,
          organizationId: extendedUser.organizationId
        } : null);
        
        setSession(currentSession);
        setUser(extendedUser);
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession ? "Logged in" : "Not logged in");
      const extendedUser = getUserWithName(currentSession?.user ?? null);
      console.log("User from initial session:", extendedUser ? {
        id: extendedUser.id, 
        name: extendedUser.name,
        organizationId: extendedUser.organizationId
      } : null);
      
      setSession(currentSession);
      setUser(extendedUser);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async (name: string, email: string, password: string, role: "admin" | "agent") => {
    setIsLoading(true);
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        }
      });
      
      if (error) {
        throw error;
      }
      
      console.log("User created successfully:", data);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // First clear state so the UI updates immediately
      setUser(null);
      setSession(null);
      
      // Clear organization data
      localStorage.removeItem('currentOrganizationId');
      
      // Then sign out from supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoading(false);
      // Clear any cached data that might be causing issues
      localStorage.removeItem('supabase.auth.token');
    }
  };

  // Determine if user is admin from metadata
  const isAdmin = !!user && user.user_metadata?.role === "admin";
  const isAuthenticated = !!session;

  const contextValue: AuthContextType = {
    user,
    session,
    isAuthenticated,
    isAdmin,
    isLoading,
    login,
    createUser,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

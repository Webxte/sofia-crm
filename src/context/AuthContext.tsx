
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

// Extend the User type to include the name property
interface ExtendedUser extends User {
  name?: string;
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const getUserWithName = useCallback((supabaseUser: User | null): ExtendedUser | null => {
    if (!supabaseUser) return null;
    
    return {
      ...supabaseUser,
      name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || '',
    };
  }, []);

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        const extendedUser = getUserWithName(currentSession?.user ?? null);
        console.log("User with auth change:", extendedUser ? {
          id: extendedUser.id, 
          name: extendedUser.name,
        } : null);
        
        setSession(currentSession);
        setUser(extendedUser);
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession ? "Logged in" : "Not logged in");
      const extendedUser = getUserWithName(currentSession?.user ?? null);
      console.log("User from initial session:", extendedUser ? {
        id: extendedUser.id, 
        name: extendedUser.name,
      } : null);
      
      setSession(currentSession);
      setUser(extendedUser);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [getUserWithName]);

  const isAdmin = useMemo(() => !!user && user.user_metadata?.role === "admin", [user]);
  const isAuthenticated = useMemo(() => !!session, [session]);

  const loginFn = useCallback(async (email: string, password: string) => {
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
  }, []);

  const createUserFn = useCallback(async (name: string, email: string, password: string, role: "admin" | "agent") => {
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
  }, []);

  const logoutFn = useCallback(async () => {
    setIsLoading(true);
    try {
      setUser(null);
      setSession(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue = useMemo<AuthContextType>(() => ({
    user,
    session,
    isAuthenticated,
    isAdmin,
    isLoading,
    login: loginFn,
    createUser: createUserFn,
    logout: logoutFn
  }), [user, session, isAuthenticated, isAdmin, isLoading, loginFn, createUserFn, logoutFn]);

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


import * as React from "react";
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

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

// Component that uses hooks - only rendered when React is ready
const AuthProviderInner = ({ children }: { children: React.ReactNode }) => {
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
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        logger.debug("Setting up auth state listener");
        
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            if (!mounted) return;
            
            logger.debug("Auth state changed:", event);
            const extendedUser = getUserWithName(currentSession?.user ?? null);
            logger.debug("User with auth change:", extendedUser ? {
              id: extendedUser.id, 
              name: extendedUser.name,
            } : null);
            
            setSession(currentSession);
            setUser(extendedUser);
            setIsLoading(false);
          }
        );

        // Get initial session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!mounted) return;
        
        logger.debug("Initial session check:", currentSession ? "Logged in" : "Not logged in");
        const extendedUser = getUserWithName(currentSession?.user ?? null);
        logger.debug("User from initial session:", extendedUser ? {
          id: extendedUser.id, 
          name: extendedUser.name,
        } : null);
        
        setSession(currentSession);
        setUser(extendedUser);
        setIsLoading(false);

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        logger.error("Auth initialization error:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const cleanup = initializeAuth();
    
    return () => {
      mounted = false;
      cleanup?.then(cleanupFn => cleanupFn?.());
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
        logger.error("Login error:", error);
        throw error;
      }
      
      logger.info("User logged in successfully");
    } catch (error) {
      logger.error("Login failed:", error);
      throw error;
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
        logger.error("User creation error:", error);
        throw error;
      }
      
      logger.info("User created successfully:", data);
    } catch (error) {
      logger.error("User creation failed:", error);
      throw error;
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
        logger.error("Logout error:", error);
        throw error;
      }
      
      logger.info("User logged out successfully");
    } catch (error) {
      logger.error("Logout failed:", error);
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

// Class component wrapper to avoid hook issues during initial load
class AuthProviderWrapper extends React.Component<{ children: React.ReactNode }> {
  render() {
    return React.createElement(AuthProviderInner, null, this.props.children);
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(AuthProviderWrapper, { children });
};


export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

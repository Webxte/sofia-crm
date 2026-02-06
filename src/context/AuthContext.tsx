import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "@/utils/toast";

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

const defaultContextValue: AuthContextType = {
  user: null,
  session: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  login: async () => {},
  createUser: async () => {},
  logout: async () => {},
};

const AuthContext = React.createContext<AuthContextType>(defaultContextValue);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<ExtendedUser | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const getUserWithName = React.useCallback((supabaseUser: User | null): ExtendedUser | null => {
    if (!supabaseUser) return null;
    return {
      ...supabaseUser,
      name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || '',
    };
  }, []);

  React.useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        timeoutId = setTimeout(() => {
          if (mounted) setIsLoading(false);
        }, 5000);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            if (!mounted) return;
            if (timeoutId) clearTimeout(timeoutId);

            const extendedUser = getUserWithName(currentSession?.user ?? null);
            setSession(currentSession);
            setUser(extendedUser);

            if (event === 'SIGNED_OUT') {
              setUser(null);
              setSession(null);
            }
            setIsLoading(false);
          }
        );

        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("AuthContext: Error getting session:", error);
          if (mounted) setIsLoading(false);
          return;
        }

        if (mounted) {
          if (currentSession) {
            const extendedUser = getUserWithName(currentSession.user);
            setSession(currentSession);
            setUser(extendedUser);
          }
          if (timeoutId) clearTimeout(timeoutId);
          setIsLoading(false);
        }

        return () => {
          subscription.unsubscribe();
          if (timeoutId) clearTimeout(timeoutId);
        };
      } catch (error) {
        console.error("AuthContext: Auth initialization error:", error);
        if (mounted) {
          if (timeoutId) clearTimeout(timeoutId);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [getUserWithName]);

  const isAuthenticated = React.useMemo(() => !!user && !!session, [user, session]);
  const isAdmin = React.useMemo(() => user?.user_metadata?.role === "admin" || false, [user]);

  const login = React.useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        const extendedUser = getUserWithName(data.user);
        setUser(extendedUser);
        setSession(data.session);
        toast.success("Welcome!", {
          description: `Welcome back, ${extendedUser?.name || 'User'}!`,
        });
      }
    } catch (error: any) {
      toast.error("Login failed", {
        description: error.message || "Please check your credentials and try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getUserWithName]);

  const createUser = React.useCallback(async (name: string, email: string, password: string, role: "admin" | "agent") => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role } },
      });
      if (error) throw error;
      if (data.user) {
        toast.success("Account created!", {
          description: "Your account has been created successfully.",
        });
      }
    } catch (error: any) {
      toast.error("Failed to create account", {
        description: error.message || "Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      toast.success("Goodbye!", {
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast.error("Logout failed", {
        description: error.message || "Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue = React.useMemo(() => ({
    user,
    session,
    isAuthenticated,
    isAdmin,
    isLoading,
    login,
    createUser,
    logout,
  }), [user, session, isAuthenticated, isAdmin, isLoading, login, createUser, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

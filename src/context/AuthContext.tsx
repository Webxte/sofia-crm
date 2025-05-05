
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
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [membershipChecked, setMembershipChecked] = useState(false);
  
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
  
  // Function to ensure the user has access to the Belmorso organization
  const ensureUserHasBelmorsoAccess = async (currentUser: ExtendedUser | null) => {
    if (!currentUser) return;
    
    try {
      console.log("Checking if user has organization access");
      
      // First check if user is already a member of any organization
      const { data: existingMemberships, error: membershipError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', currentUser.id);
      
      if (membershipError) {
        console.error("Error checking existing memberships:", membershipError);
        return;
      }
      
      if (existingMemberships && existingMemberships.length > 0) {
        console.log("User is already a member of organizations:", existingMemberships);
        setMembershipChecked(true);
        return; // User already has organization access
      }
      
      console.log("User has no organization memberships, looking for Belmorso...");
      
      // Check if Belmorso organization exists
      const { data: belmorsoOrg, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .eq('name', 'Belmorso')
        .maybeSingle();
      
      if (orgError) {
        console.error("Error finding Belmorso organization:", orgError);
        return;
      }
      
      let belmorsoOrgId: string;
      
      if (!belmorsoOrg) {
        // Create Belmorso organization if it doesn't exist
        console.log("Creating Belmorso organization...");
        const { data: newOrg, error: createError } = await supabase
          .from('organizations')
          .insert([{
            name: 'Belmorso',
            slug: 'belmorso'
          }])
          .select('id')
          .single();
        
        if (createError || !newOrg) {
          console.error("Error creating Belmorso organization:", createError);
          return;
        }
        
        belmorsoOrgId = newOrg.id;
        console.log("Created Belmorso organization with ID:", belmorsoOrgId);
        
        // Create initial settings for the organization
        await supabase
          .from('settings')
          .insert([{
            organization_id: belmorsoOrgId,
            company_name: 'Belmorso'
          }]);
          
        // Create a password for the organization - Fixed TypeScript error here
        // First generate a salt
        const { data: salt } = await supabase.rpc('gen_salt', { type: 'bf' });
        
        if (!salt) {
          console.error("Failed to generate salt for password");
          return;
        }
        
        // Then create the hash with the salt
        const { data: hash } = await supabase.rpc('crypt', { 
          password: 'Belmorso2024!', 
          salt: salt 
        });
        
        if (!hash) {
          console.error("Failed to generate password hash");
          return;
        }
        
        // Finally insert the hashed password
        await supabase
          .from('organization_passwords')
          .insert([{
            organization_id: belmorsoOrgId,
            password_hash: hash
          }]);
      } else {
        belmorsoOrgId = belmorsoOrg.id;
        console.log("Found existing Belmorso organization with ID:", belmorsoOrgId);
      }
      
      // Add user as owner of Belmorso organization
      console.log("Adding user as owner of Belmorso organization...");
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert([{
          organization_id: belmorsoOrgId,
          user_id: currentUser.id,
          role: 'owner'
        }]);
      
      if (memberError) {
        console.error("Error adding user as organization member:", memberError);
        toast({
          title: "Error",
          description: "Failed to add you to the organization. Please try logging out and back in.",
          variant: "destructive"
        });
        return;
      }
      
      console.log("Successfully added user as owner of Belmorso organization");
      
      // Set this as the current organization in localStorage
      localStorage.setItem('currentOrganizationId', belmorsoOrgId);
      
      // Notify user
      toast({
        title: "Organization Access Granted",
        description: "You've been added as an owner of the Belmorso organization.",
      });
      
      setMembershipChecked(true);
    } catch (error) {
      console.error("Error in ensureUserHasBelmorsoAccess:", error);
      setMembershipChecked(true); // Mark as checked even on error to prevent infinite loops
    }
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
        
        if (event === 'SIGNED_IN' && extendedUser) {
          // Delay to ensure DB connections are established
          setTimeout(() => {
            ensureUserHasBelmorsoAccess(extendedUser);
          }, 500);
        } else if (event === 'SIGNED_OUT') {
          setMembershipChecked(false);
        }
        
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

      // If user is logged in, check/create organization access with a delay
      if (extendedUser) {
        // Delay to ensure DB connections are established
        setTimeout(() => {
          ensureUserHasBelmorsoAccess(extendedUser);
        }, 500);
      }
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
      setMembershipChecked(false);
      
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

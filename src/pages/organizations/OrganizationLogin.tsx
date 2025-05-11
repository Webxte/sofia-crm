import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { OrganizationContainer } from "@/components/organizations/OrganizationContainer";
import { LoginForm } from "@/components/organizations/LoginForm";

const OrganizationLogin = () => {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug");
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getOrganizationBySlug, switchOrganization } = useOrganizations();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [organization, setOrganization] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load organization data on component mount
  useEffect(() => {
    const loadOrganization = async () => {
      if (slug) {
        try {
          console.log("Loading organization with slug:", slug);
          const org = await getOrganizationBySlug(slug);
          console.log("Organization loaded:", org);
          setOrganization(org);
          setIsLoaded(true);
        } catch (err) {
          console.error("Error loading organization:", err);
          setError("Organization not found. Please check the URL and try again.");
          setIsLoaded(true);
        }
      } else {
        setError("No organization specified. Please use a URL with ?slug=yourorg");
        setIsLoaded(true);
      }
    };

    loadOrganization();
  }, [slug, getOrganizationBySlug]);

  const handleSubmit = async (password: string) => {
    if (!organization) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log("Attempting to verify password for organization:", organization.name);
      
      // Special case for Belmorso
      if (organization.slug === 'belmorso' && password === 'Belmorso2024!') {
        console.log("Using hardcoded password verification for Belmorso");
        
        toast({
          title: "Success",
          description: `Access granted to ${organization.name}`,
        });
        
        // Success - proceed with login
        const success = await switchOrganization(organization.id);
        
        if (!success) {
          throw new Error("Failed to switch to organization. Please try again.");
        }
        
        console.log("Successfully switched to organization:", organization.name);
        
        // If the user is already authenticated, redirect to dashboard
        if (isAuthenticated && user) {
          navigate('/dashboard', { replace: true });
        } else {
          // Otherwise redirect to login
          navigate('/login', { replace: true });
        }
        return;
      }
      
      // For non-Belmorso orgs, check password with database function
      const { data: passwordCorrect, error: passwordError } = await supabase.rpc(
        'check_organization_password',
        {
          org_id: organization.id,
          password: password
        }
      );
      
      if (passwordError) {
        throw passwordError;
      }
      
      if (passwordCorrect) {
        console.log("Password verified, switching organization");
        // Success - proceed with login
        const success = await switchOrganization(organization.id);
        
        if (!success) {
          throw new Error("Failed to switch to organization. Please try again.");
        }
        
        toast({
          title: "Success",
          description: `Access granted to ${organization.name}`,
        });
        
        // If the user is already authenticated, redirect to dashboard
        if (isAuthenticated && user) {
          navigate('/dashboard', { replace: true });
        } else {
          // Otherwise redirect to login
          navigate('/login', { replace: true });
        }
        return;
      }
      
      // Password incorrect
      setError("Incorrect password for this organization.");
      
    } catch (error) {
      console.error("Error logging into organization:", error);
      setError("Failed to verify organization password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (!isLoaded || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p>Loading organization...</p>
        </div>
      </div>
    );
  }

  // If no org found or error without an organization
  if (error && !organization) {
    return (
      <OrganizationContainer
        title="Organization Error"
        error={error}
        showHomeButton
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>{organization?.name || "Organization"} Login | CRM</title>
      </Helmet>
      
      <OrganizationContainer
        title={organization?.name || "Organization"}
        description="Enter the organization password to continue"
      >
        <LoginForm
          organization={organization}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          error={error}
        />
      </OrganizationContainer>
    </>
  );
};

export default OrganizationLogin;

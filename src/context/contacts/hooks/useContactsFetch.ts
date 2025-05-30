
import { useState, useCallback } from "react";
import { Contact } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { transformDatabaseContact } from "../contactUtils";

export const useContactsFetch = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { currentOrganization } = useOrganizations();

  const fetchContacts = useCallback(async () => {
    if (!user || !currentOrganization) {
      console.log("No user or organization, skipping contacts fetch");
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching contacts for organization:", currentOrganization.id);
      
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("organization_id", currentOrganization.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching contacts:", error);
        throw error;
      }

      const transformedContacts = data?.map(transformDatabaseContact) || [];
      console.log(`Fetched ${transformedContacts.length} contacts`);
      setContacts(transformedContacts);
    } catch (error) {
      console.error("Error in fetchContacts:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, currentOrganization]);

  return {
    contacts,
    setContacts,
    loading,
    fetchContacts
  };
};

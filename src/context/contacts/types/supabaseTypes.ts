
// Define types to match the Supabase database schema
export interface SupabaseContact {
  id: string;
  full_name: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  address: string | null;
  notes: string | null;
  position: string | null;
  agent_id: string | null;
  agent_name: string | null;
  source: string | null; // Added source field
  created_at: string;
  updated_at: string;
}

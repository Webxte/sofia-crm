-- Create a function that returns contact company/name for an order's contact_id
-- This uses SECURITY DEFINER to bypass RLS on contacts table
-- so that orders can always display the correct company name
CREATE OR REPLACE FUNCTION public.get_order_contact_info(p_contact_id uuid)
RETURNS TABLE(company text, full_name text) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.company, c.full_name
  FROM contacts c
  WHERE c.id = p_contact_id
  LIMIT 1;
$$;
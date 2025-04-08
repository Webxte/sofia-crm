
-- Add custom_links column to settings table if it doesn't exist
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS custom_links JSONB DEFAULT '[]'::jsonb;

-- Add default_contact_email_message column if it doesn't exist
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS default_contact_email_message TEXT;

-- Add catalog_url column if it doesn't exist
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS catalog_url TEXT;

-- Add price_list_url column if it doesn't exist
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS price_list_url TEXT;

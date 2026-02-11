-- Allow all authenticated users to read settings (email templates, company info, etc.)
CREATE POLICY "All authenticated users can read settings"
ON public.settings
FOR SELECT
USING (auth.uid() IS NOT NULL);
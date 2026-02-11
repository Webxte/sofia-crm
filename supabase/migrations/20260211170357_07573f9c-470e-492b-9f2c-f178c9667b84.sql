
-- Drop the existing permissive INSERT policy that allows NULL user_id
DROP POLICY IF EXISTS "Any authenticated user can insert analytics events" ON public.analytics_events;

-- Create stricter INSERT policy requiring user_id = auth.uid()
CREATE POLICY "Authenticated users can insert their own analytics events"
ON public.analytics_events
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

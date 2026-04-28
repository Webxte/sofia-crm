-- Feature: Pipeline stage and contact type for contacts

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS pipeline_stage text DEFAULT 'lead'
    CHECK (pipeline_stage IN ('lead','contacted','qualified','proposal_sent','negotiation','won','lost')),
  ADD COLUMN IF NOT EXISTS contact_type text DEFAULT 'lead'
    CHECK (contact_type IN ('lead','prospect','customer')),
  ADD COLUMN IF NOT EXISTS pipeline_value numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pipeline_notes text;

-- Back-fill existing contacts
UPDATE public.contacts SET pipeline_stage = 'lead'  WHERE pipeline_stage IS NULL;
UPDATE public.contacts SET contact_type  = 'lead'   WHERE contact_type  IS NULL;

-- Feature: Onboarding wizard completion flag on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed    boolean     DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_dismissed_at timestamptz DEFAULT NULL;

-- Allow users to update their own profile row (needed for onboarding flag)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'profiles'
      AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());
  END IF;
END
$$;

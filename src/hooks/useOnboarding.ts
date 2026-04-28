import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/settings";

export const useOnboarding = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { settings, loading: settingsLoading } = useSettings();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setOnboardingCompleted(null);
      setProfileLoading(false);
      return;
    }
    let cancelled = false;
    setProfileLoading(true);

    supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          // Column might not exist yet (migration pending) — treat as not completed
          setOnboardingCompleted(false);
        } else {
          setOnboardingCompleted((data as any)?.onboarding_completed ?? false);
        }
        setProfileLoading(false);
      });

    return () => { cancelled = true; };
  }, [user?.id]);

  const shouldShowOnboarding = useMemo(() => {
    if (authLoading || settingsLoading || profileLoading) return false;
    if (!isAdmin || !user) return false;
    if (onboardingCompleted) return false;
    // Show if company name hasn't been set yet
    return !settings?.companyName;
  }, [authLoading, settingsLoading, profileLoading, isAdmin, user, onboardingCompleted, settings?.companyName]);

  const completeOnboarding = async () => {
    if (!user) return;
    setOnboardingCompleted(true);
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true, onboarding_dismissed_at: new Date().toISOString() } as any)
      .eq("id", user.id);
  };

  const dismissOnboarding = async () => {
    await completeOnboarding();
  };

  return { shouldShowOnboarding, completeOnboarding, dismissOnboarding };
};

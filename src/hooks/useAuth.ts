/**
 * LOCAL AUTH SHIM
 * Mirrors the sapphire-cockpit `useAuth` surface so every copied control-panel
 * module works end-to-end inside this cockpit without an external auth backend.
 */

import { useCallback, useMemo } from "react";
import { toast } from "sonner";

export interface CockpitUser {
  id: string;
  email: string;
  user_metadata: { full_name: string; avatar_url?: string };
}

export function useAuth() {
  const user = useMemo<CockpitUser>(
    () => ({
      id: "boss-owner-0001",
      email: "boss@softwarevala.com",
      user_metadata: { full_name: "Boss Owner" },
    }),
    [],
  );

  const signOut = useCallback(async () => {
    toast.info("Session ended securely");
  }, []);

  return {
    user,
    session: null,
    loading: false,
    userRole: "boss_owner" as const,
    isBossOwner: true,
    isCEO: false,
    isAdmin: true,
    signOut,
  };
}

export default useAuth;

/**
 * ROUTER COMPAT SHIM
 * The copied modules were authored against react-router-dom. This cockpit uses
 * TanStack Router, so these thin adapters keep the module code unchanged.
 */

import { useCallback } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";

export function useNavigate() {
  const router = useRouter();
  return useCallback(
    (to: string | number) => {
      if (typeof to === "number") {
        if (typeof window !== "undefined") window.history.go(to);
        return;
      }
      router.navigate({ to: to as never }).catch(() => {
        if (typeof window !== "undefined") window.location.assign(to);
      });
    },
    [router],
  );
}

export function useLocation() {
  return useRouterState({ select: (s) => s.location });
}

export function useParams<T extends Record<string, string> = Record<string, string>>() {
  return useRouterState({ select: (s) => s.matches.at(-1)?.params ?? {} }) as T;
}

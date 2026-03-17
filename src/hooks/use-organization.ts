import { useSession } from "@/providers/session-provider";

export function useOrganization() {
  const { organization, loading, refreshOrganization } = useSession();
  return { organization, loading, refreshOrganization };
}

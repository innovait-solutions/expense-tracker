import { useSession } from "@/providers/session-provider";

export function useAuth() {
  const { user, loading, refreshUser } = useSession();
  return { user, loading, refreshUser };
}

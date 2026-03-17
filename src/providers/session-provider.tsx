"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

interface SessionContextType {
  user: any;
  organization: any;
  loading: boolean;
  refreshUser: () => Promise<void>;
  refreshOrganization: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get("/api/auth/me");
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setUser(null);
    }
  }, []);

  const fetchOrganization = useCallback(async () => {
    try {
      const res = await axios.get("/api/organization");
      setOrganization(res.data);
    } catch (err) {
      console.error("Failed to fetch organization:", err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchUser(), fetchOrganization()]);
      setLoading(false);
    };
    init();
  }, [fetchUser, fetchOrganization]);

  return (
    <SessionContext.Provider
      value={{
        user,
        organization,
        loading,
        refreshUser: fetchUser,
        refreshOrganization: fetchOrganization,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

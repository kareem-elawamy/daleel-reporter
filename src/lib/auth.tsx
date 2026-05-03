import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiClient, setAuthToken, getAuthToken } from "./api-client";
import { useNavigate, useRouter } from "@tanstack/react-router";

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  roles: string[];
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (email: string, password: string, displayName?: string) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string, token: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await apiClient<User>("/auth/me");
      setUser(data);
    } catch (e) {
      console.error("Failed to fetch user:", e);
      setUser(null);
      setAuthToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await apiClient<{ accessToken: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(res.accessToken);
      setUser(res.user);
      router.invalidate();
      return { error: null };
    } catch (e: any) {
      return { error: e.message || "Failed to sign in" };
    }
  };

  const register = async (email: string, password: string, displayName?: string) => {
    try {
      await apiClient("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, displayName }),
      });
      return login(email, password);
    } catch (e: any) {
      return { error: e.message || "Failed to register" };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await apiClient("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      return { error: null };
    } catch (e: any) {
      return { error: e.message || "Failed to reset password" };
    }
  };

  const updatePassword = async (password: string, token: string) => {
    try {
      await apiClient("/auth/update-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword: password }),
      });
      return { error: null };
    } catch (e: any) {
      return { error: e.message || "Failed to update password" };
    }
  };

  const signOut = async () => {
    try {
      await apiClient("/auth/logout", { method: "POST" });
    } catch (e) {
      // ignore
    }
    setAuthToken(null);
    setUser(null);
    router.invalidate();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, resetPassword, updatePassword, signOut, refreshAuth: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

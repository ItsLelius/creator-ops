import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import type { CurrentUser, UserRole } from "../types";

type ProfileRow = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: "active" | "disabled";
};

type AuthContextValue = {
  currentUser: CurrentUser | null;
  loading: boolean;
  authError: string;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, name, role, status")
      .eq("id", userId)
      .single<ProfileRow>();

    if (error) {
      throw new Error(
        "Login worked, but this account is not registered in Adi Studios.",
      );
    }

    if (!data) {
      throw new Error("No profile found for this account.");
    }

    if (data.status !== "active") {
      throw new Error("This account is disabled.");
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
    } satisfies CurrentUser;
  }

  async function loadCurrentUser(userId: string) {
    try {
      const profile = await fetchProfile(userId);
      setCurrentUser(profile);
      setAuthError("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load profile.";

      setCurrentUser(null);
      setAuthError(message);
      await supabase.auth.signOut();
    }
  }

  useEffect(() => {
    let active = true;

    async function initializeAuth() {
      setLoading(true);

      const { data, error } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (error) {
        setAuthError(error.message);
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      if (data.session?.user) {
        await loadCurrentUser(data.session.user.id);
      } else {
        setCurrentUser(null);
      }

      if (active) {
        setLoading(false);
      }
    }

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) {
        return;
      }

      if (session?.user) {
        void loadCurrentUser(session.user.id);
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signInWithPassword(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      throw new Error("Enter your email.");
    }

    if (!password) {
      throw new Error("Enter your password.");
    }

    setAuthError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      setAuthError(error.message);
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("Login succeeded, but user could not be loaded.");
    }

    await loadCurrentUser(data.user.id);
  }

  async function signOut() {
    setAuthError("");
    await supabase.auth.signOut();
    setCurrentUser(null);
  }

  async function refreshProfile() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      setAuthError(error.message);
      throw new Error(error.message);
    }

    if (!user) {
      setCurrentUser(null);
      return;
    }

    await loadCurrentUser(user.id);
  }

  function clearAuthError() {
    setAuthError("");
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      loading,
      authError,
      signInWithPassword,
      signOut,
      clearAuthError,
      refreshProfile,
    }),
    [currentUser, loading, authError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
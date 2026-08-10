import { create } from "zustand";
import { getCurrentUser, type AuthUser } from "../api/auth";

type AuthStore = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  checkSession: () => Promise<void>;
  clearSession: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  error: null,

  checkSession: async () => {
    set({ loading: true, error: null });
    try {
      const user = await getCurrentUser();
      set({ user, loading: false });
    } catch (err) {
      set({
        user: null,
        loading: false,
        error: err instanceof Error ? err.message : "Auth check failed",
      });
    }
  },

  clearSession: () => {
    set({ user: null, loading: false, error: null });
  },
}));
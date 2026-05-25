import { create } from "zustand";
import { getAllUsers } from "../api/users";
import type { User } from "../types/users";

type UserStore = {
  users: User[];
  selectedUser: User | null;
  error: string | null;
  fetchUsers: () => Promise<void>;
  setSelectedUser: (user: User) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  selectedUser: null,

  error: null,

  fetchUsers: async () => {
    set({ error: null });
    try {
      const res = await getAllUsers();
      set({ users: res.result, selectedUser: res.result[0] ?? null });
    } catch (err) {
      set({ error: `Failed to fetch users ${err}` });
    }
  },

  setSelectedUser: (user: User) => set({ selectedUser: user }),
}));

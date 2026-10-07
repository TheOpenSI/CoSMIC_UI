/// --- Core libraries --- ///
import { create } from "zustand";


/// --- Type hints --- ///
import type { User } from "../types/users";


/// --- Internal libraries --- ///
import { getAllUsers } from "../api/users";
import { getCurrentUser } from "../api/auth";


//  only for now as we are still in dev mode , this will be removed later for auth purposes
const DEV_FALLBACK_FIRST_USER = true;


type UserStore = {
    users: User[];
    selectedUser: User | null;
    error: string | null;
    fetchUsers: () => Promise<void>;
    setSelectedUser: (user: User) => void;
};


export const useUserStore = create<UserStore>(
    (set) => ({
        users: [],
        selectedUser: null,
        error: null,

        // NOTE:
        // We request the 'Users API' and resolve the logged-in user here so the
        // rest of the app can read a single `selectedUser`.
        fetchUsers: async () => {
            set({ error: null });

            try {
                const [userResponse, me] = await Promise.all([
                    getAllUsers(),
                    getCurrentUser(),
                ]);

                // NOTE:
                // Fall back to the first user while AuthN/AuthZ is still being
				// wired up. Once auth is complete this fallback will be removed.
                const users = userResponse.result;
                let selected: User | null = null;

                if (me?.user_id) {
                    selected = users.find((u) => u.id === me.user_id) ?? null;

                } else if (DEV_FALLBACK_FIRST_USER) {
                    selected = users[0] ?? null; // temporary
                }

                set({
                    users,
                    selectedUser: selected,
                });

            } catch (err) {
                set({
                    error: `Failed to fetch users ${err}`
                });
            }
        },
        setSelectedUser: (user) => set({ selectedUser: user }),
    })
);

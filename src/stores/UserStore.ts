/// --- Core libraries --- ///
import { create } from "zustand";


/// --- Type hints --- ///
import type { User } from "../types/users";
import type { AuthUser } from "../api/auth";


/// --- Internal libraries --- ///
import { getAllUsers } from "../api/users";
import { hasAdminAccess } from "../lib/authorisation";


/**
 * Build the minimum user shape required by the chat/dashboard views when the
 * full Users list is intentionally not fetched (regular `user` role).
 */
function userFromAuth(me: AuthUser): User | null {
	if (!me.user_id) return null;

	return {
		id: me.user_id,
		name: me.name ?? me.email ?? "User",
		email: me.email ?? "",
		role_id: "",
		create_on: "",
	};
}


type UserStore = {
	users: User[];
	selectedUser: User | null;
	error: string | null;
	fetchUsers: (me: AuthUser) => Promise<void>;
	setSelectedUser: (user: User) => void;
};


export const useUserStore = create<UserStore>(
	(set) => ({
		users: [],
		selectedUser: null,
		error: null,

		// NOTE:
		// A regular `user` only needs their own identity, so the admin-only
		// Users API is never called for that role. Admins additionally load the
		// full list so they can inspect other users later on.
		fetchUsers: async (me: AuthUser) => {
			set({ error: null });

			try {
				if (!hasAdminAccess(me.roles)) {
					set({
						users: [],
						selectedUser: userFromAuth(me),
					});
					return;
				}

				const userResponse = await getAllUsers();
				const users = userResponse.result;
				const selected = users.find((u) => u.id === me.user_id)
					?? userFromAuth(me);

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

/// --- Core libraries --- ///
import { create } from "zustand";


/// --- Type hints --- ///
import type { User } from "../types/users";
import type { Role } from "../types/roles";


/// --- Internal libraries --- ///
import { getAllUsers} from "../api/users";
import { getAllRoles } from "../api/roles";
import { getCurrentUser } from "../api/auth";


//  only for now as we are still in dev mode , this will be removed later for auth purposes
const DEV_FALLBACK_FIRST_USER = true;




type UserStore = {
    users: User[];
    roles: Role[];
    selectedUser: User | null;
    selectedUserRole: string | null;
    error: string | null;
    fetchUsers: () => Promise<void>;
    setSelectedUser: (user: User) => void;
};

export const useUserStore = create<UserStore>(
    (
        set,
        get
    ) => ({
        users: [],
        roles: [],
        selectedUser: null,
        selectedUserRole: null,
        error: null,

        // NOTE:
        // We create requests to 'Users API' & 'Roles API' endpoint here
        fetchUsers: async () => {
            set({
                error: null
            });

            try {
                const [
                    userResponse,
                    roleResponse,
                    me
                ] = await Promise.all([
                    getAllUsers(),
                    getAllRoles(), 
                    getCurrentUser()
                ]);

                // NOTE:
                // This might looks complex because of the tenary syntax (most
                // JS/TS code I know prefers to style it this way), but it just
                // to ensure we grab the first user's information, particulary
                // he/she role name so that we can perform further logic.
                //
                // However, when we start implementing AuthN and AuthZ, this
                // logic will need to be updated to grab data from logged user
                // based on a certain "thing" (e.g., cookie, session, etc)
                const roles = roleResponse.result;
                const users = userResponse.result;

                let selected: User | null = null;
                if (me?.user_id) {
                    selected = users.find((u) => u.id === me.user_id) ?? null;
                    // optional: if not in list, fetch one user
                    // if (!selected) selected = (await getUser(me.user_id)).result;
                } else if (DEV_FALLBACK_FIRST_USER) {
                    selected = users[0] ?? null; // temporary
                }
                const selectedUserRole = selected
                    ? (roles.find((r) => r.id === selected!.role_id)?.name ??
                    me?.roles?.[0] ??
                    null)
                    : null;
                
                set({
                    users,
                    roles,
                    selectedUser: selected,
                    selectedUserRole,
                });

            } catch (err) {
                set({
                    error: `Failed to fetch users ${err}`
                });
            }
        },
        // NOTE:
        // We put user data into React `useState()` (similar concepts with FastAPI
        // `State()`) after fetching from both APIs here
        setSelectedUser: (user) => {
            const { roles } = get();
            set({
              selectedUser: user,
              selectedUserRole:
                roles.find((r) => r.id === user.role_id)?.name ?? null,
            });
          },
    })
);

/// --- Core libraries --- ///
import { create } from "zustand";


/// --- Type hints --- ///
import type { User } from "../types/users";
import type { Role } from "../types/roles";


/// --- Internal libraries --- ///
import { getAllUsers } from "../api/users";
import { getAllRoles } from "../api/roles";



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
                    roleResponse
                ] = await Promise.all([
                    getAllUsers(),
                    getAllRoles()
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
                const firstUserData: User | null = userResponse.result[0] ?? null;
                const firstUserRole: string | null = firstUserData
                    ? (roleResponse.result.find((role) => role.id === firstUserData.role_id)?.name ?? null)
                    : null;

                set({
                    users: userResponse.result,
                    selectedUser: firstUserData,
                    selectedUserRole: firstUserRole
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
        setSelectedUser: (user: User) => {
            const { roles }: UserStore = get();
            const role: string | null = (roles.find((role) => role.id === user.role_id)?.name ?? null);

            set({
                selectedUser: user,
                selectedUserRole: role
            })
        },
    })
);

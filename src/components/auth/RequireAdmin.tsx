/// --- Core libraries --- ///
import {
	Navigate,
	Outlet
} from "react-router-dom";


/// --- Type hints --- ///


/// --- Internal libraries --- ///
import { useAuthStore } from "../../stores/AuthStore";
import { hasAdminAccess } from "../../lib/authorisation";


/**
 * Guards the admin-only sections within Settings page. `RequireAuth` has already
 * resolved the session, so the role is available synchronously here
 */
export default function RequireAdmin() {
	const user = useAuthStore((state) => state.user);

	if (!hasAdminAccess(user?.roles)) {
		return <Navigate to="/settings/dashboard" replace />;
	}

	return <Outlet />;
}

/**
 * Keycloak issues the realm role list exposed by the Auth BFF's
 * `GET /api/v1/auth/me` as `roles`.
 *
 * Anything that is not explicitly an admin is treated as a regular user so a
 * missing/unknown role never grants extra access.
 */
export function hasAdminAccess(roles: string[] | null | undefined): boolean {
	return Array.isArray(roles)
		&& roles.some(
			(role) => role.trim().toLowerCase() === "admin"
		);
}

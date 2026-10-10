const BFF_BASE_URL		= import.meta.env.VITE_BFF_URL ?? "http://localhost:8081";
const AUTH_API_PREFIX	= "/api/v1/auth";


export type AuthUser = {
	user_id?: string;
	sub: string;
	email?: string;
	name?: string;
	roles: string[];
	provider?: string;
};


/**
 * BFF → Keycloak. Keycloak brokers Google & Microsoft, so the platform only
 * ever needs this single login URL.
 */
export function getLoginUrl(): string {
	return `${BFF_BASE_URL}${AUTH_API_PREFIX}/login`;
}

export async function refreshSession(): Promise<boolean> {
	const response = await fetch(
		`${BFF_BASE_URL}${AUTH_API_PREFIX}/refresh`,
		{
			method: "POST",
			credentials: "include",
		}
	);
	return response.ok;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
	const me = () => fetch(
		`${BFF_BASE_URL}${AUTH_API_PREFIX}/me`,
		{ credentials: "include", }
	);

	let response = await me();

	if (response.status === 401) {
		const refreshed = await refreshSession();

		if (!refreshed) return null;

		response = await me();

		if (response.status === 401) return null;
	}

	if (!response.ok) {
		throw new Error(`Auth check failed (HTTP ${response.status})`);
	}

	return (await response.json()) as AuthUser;
}

export function logout(): void {
	const form = document.createElement("form");
	form.method = "POST";
	form.action = `${BFF_BASE_URL}${AUTH_API_PREFIX}/logout`;

	document.body.appendChild(form);

	form.submit();
}

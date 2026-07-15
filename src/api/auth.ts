const BFF_BASE_URL = import.meta.env.VITE_BFF_URL ?? "http://localhost:8081";
const KEYCLOAK_PUBLIC_URL =
  import.meta.env.VITE_KEYCLOAK_URL ?? "http://localhost:8080";
const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM ?? "cosmic";
const AUTH_API_PREFIX = "/api/v1/auth";

export type AuthUser = {
  sub: string;
  email?: string;
  name?: string;
  roles: string[];
};

/** Browser navigates to BFF → Keycloak login page */
export function getLoginUrl(): string {
  return `${BFF_BASE_URL}${AUTH_API_PREFIX}/login`;
}

/** Keycloak self-registration page (realm must have registrationAllowed: true) */
export function getRegisterUrl(): string {
  const params = new URLSearchParams({
    client_id: "cosmic-bff",
    redirect_uri: `${BFF_BASE_URL}${AUTH_API_PREFIX}/callback`,
    response_type: "code",
    scope: "openid profile email",
  });
  return `${KEYCLOAK_PUBLIC_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/registrations?${params}`;
}

/** Ask BFF who is logged in (reads httpOnly cookie) */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch(`${BFF_BASE_URL}${AUTH_API_PREFIX}/me`, {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Auth check failed (HTTP ${response.status})`);
  }

  return (await response.json()) as AuthUser;
}

/** POST logout via hidden form (simple way to hit POST /auth/logout) */
export function logout(): void {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = `${BFF_BASE_URL}${AUTH_API_PREFIX}/logout`;
  document.body.appendChild(form);
  form.submit();
}
/// --- Core libraries --- ///


/// --- Type hints --- ///
import { useUserStore } from "../stores/UserStore";
import type {
  AllEmissionsResponse,
  MonthlyEmissionsStatsResponse,
  UserEmissionsSummaryResponse,
  UserEmissionsRollingResponse,
} from "../types/DashBoard";


/// --- Internal libraries --- ///
import { fetchWithAuth } from "./fetchWithAuth";



/**
 * Fetch ALL CodeCarbon emissions records (no filter applied).
 */
export async function getAllEmissions(): Promise<AllEmissionsResponse> {
  return fetchWithAuth(
    `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/emissions`,
  );
}

/**
 * Fetch all emissions records belonging to a specific user_id.
 * Uses the `?user_id=` selected user id from useuserstore query param on the same GET / endpoint.
 * (filtered server-side via EmissionsFilterParams).
 */
export async function getUserEmissions(): Promise<AllEmissionsResponse> {
  const selectedUser = useUserStore.getState().selectedUser;
 
  if (!selectedUser) {
    // No user selected yet — return an empty, well-shaped response instead
    // of throwing, so the Dashboard can render a clean "no data" state.
    return {
      success: false,
      count: 0,
      result: [],
    };
  }
 
  const params = new URLSearchParams({ user_id: selectedUser.id });
 
  return fetchWithAuth(
    `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/emissions?${params.toString()}`,
  );
}

/**
 * Fetch aggregated lifetime totals for the selected user (stat cards).
 */
export async function getUserEmissionsSummary(): Promise<UserEmissionsSummaryResponse> {
  const selectedUser = useUserStore.getState().selectedUser;

  if (!selectedUser) {
    return {
      success: false,
      user_id: "",
      total_emissions: 0,
      total_cpu_power: 0,
      total_gpu_power: 0,
    };
  }

  return fetchWithAuth(
    `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/emissions/stats/${selectedUser.id}/summary`,
  );
}

/**
 * Fetch aggregated rolling monthly emissions for the selected user (line chart).
 */
export async function getUserRollingStats(
  months: 3 | 6 | 12,
): Promise<UserEmissionsRollingResponse> {
  const selectedUser = useUserStore.getState().selectedUser;

  if (!selectedUser) {
    return {
      success: false,
      user_id: "",
      months,
      labels: [],
      totals: [],
    };
  }

  const params = new URLSearchParams({
    months: String(months),
  });

  return fetchWithAuth(
    `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/emissions/stats/${selectedUser.id}/rolling?${params.toString()}`,
  );
}

/**
 * Fetch aggregated monthly emissions totals for the current year (all users).
 * Used by the global CoSMIC bar chart on the dashboard.
 */
export async function getMonthlyEmissionsStats(): Promise<MonthlyEmissionsStatsResponse> {
  return fetchWithAuth(
    `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/emissions/stats`,
  );
}

/**
 * Fetch a single emission record by its emission_id.
 * Uses the `?emission_id=` query param on the same GET / endpoint.
 */
export async function getEmissionById(
  emission_id: string,
): Promise<AllEmissionsResponse> {
  const params = new URLSearchParams({ emission_id });

  return fetchWithAuth(
    `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/emissions?${params.toString()}`,
  );
}
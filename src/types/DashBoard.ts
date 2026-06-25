// --- Type definitions for Emissions API responses --- //

export interface Emission {
  id: string;
  timestamp: string;
  run_id: string;
  duration: number;
  emissions: number;
  emissions_rate: number;
  cpu_power: number;
  gpu_power: number;
  ram_power: number;
  cpu_energy: number;
  gpu_energy: number;
  ram_energy: number;
  energy_consumed: number;
  water_consumed: number;
  region: string | null;
  cloud_provider: string | null;
  cloud_region: string | null;
  os: string | null;
  cpu_count: number | null;
  cpu_model: string | null;
  gpu_count: number | null;
  gpu_model: string | null;
  longitude: number | null;
  latitude: number | null;
  ram_total_size: number | null;
  tracking_mode: string | null;
  cpu_utilization_percent: number | null;
  gpu_utilization_percent: number | null;
  ram_utilization_percent: number | null;
  ram_used_gb: number | null;
  on_cloud: string | null;
  pue: number | null;
  wue: number | null;
  user_id: string;
}

export interface AllEmissionsResponse {
  success: boolean;
  count: number;
  result: Emission[];
}
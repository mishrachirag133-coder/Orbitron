export type EngineType = 'fast' | 'deep';

export type SensorType = 
  | 'Sentinel-2' 
  | 'Landsat-8/9' 
  | 'PlanetScope' 
  | 'WorldView-3' 
  | 'MODIS';

export type JobStatus = 'pending' | 'running' | 'done' | 'failed';

export interface DownstreamUsabilityRating {
  ndvi: number; // 0 - 100
  building_seg: number; // 0 - 100
  change_detection: number; // 0 - 100
}

export interface ClassDistribution {
  clear: number; // % (e.g. 54.2)
  thick_cloud: number; // % (e.g. 23.8)
  thin_cirrus: number; // % (e.g. 14.1)
  shadow: number; // % (e.g. 7.9)
}

export interface PerBandQuality {
  band: string; // e.g. "B1", "B2", "B3", "B4", "B8", etc.
  snr: number; // Signal-to-noise ratio in dB
  degradation: number; // Atmospheric degradation percentage 0-100%
}

export interface AnalysisReport {
  clarityscore: number; // 0-100
  usable_land_percentage: number;
  cirrus_attenuation_factor: number; // e.g. 0.12 (low) to 0.85 (high)
  shadow_impact_score: number; // e.g. 15.4
  downstream_usability_rating: DownstreamUsabilityRating;
  class_distribution: ClassDistribution;
  per_band: PerBandQuality[];
}

export interface GeoBounds {
  type?: 'Polygon' | 'Envelope';
  coordinates: [number, number][]; // [ [lon, lat], [lon, lat], ... ]
  center?: [number, number]; // [lat, lon] for Leaflet / MapLibre
  bbox?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  location_name?: string;
  crs?: string;
  resolution_m?: number;
}

export interface Job {
  job_id: string;
  s3_key: string;
  sensor: SensorType | string;
  engine: EngineType;
  created_at: string;
  updated_at?: string;
  filename?: string;
  file_size_mb?: number;
  status: JobStatus;
  progress?: number; // 0 - 100 for running jobs
  mask_url?: string;
  rgb_preview_url?: string;
  bounds?: GeoBounds;
  report?: AnalysisReport;
  error_message?: string;
  duration_seconds?: number;
}

export interface PresignResponse {
  upload_url: string;
  s3_key: string;
}

export interface CreateJobPayload {
  s3_key: string;
  sensor: string;
  engine: EngineType;
  filename?: string;
  file_size_mb?: number;
}

export interface CreateJobResponse {
  job_id: string;
}

export interface AuthResponse {
  access_token: string;
  token_type?: string;
  user?: {
    email: string;
    organization?: string;
    role?: string;
  };
}

export interface HealthResponse {
  status: 'ok' | 'healthy' | 'degraded';
  version: string;
  engines: {
    fast_onnx: boolean;
    deep_transformer: boolean;
  };
  gpu_available: boolean;
  active_workers: number;
  timestamp: string;
}

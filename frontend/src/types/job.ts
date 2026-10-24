export type EngineType = 'fast' | 'deep';

export type SensorType = 
  | 'Sentinel-2' 
  | 'Sentinel-2 L2A'
  | 'Landsat-8/9' 
  | 'PlanetScope' 
  | 'WorldView-3' 
  | 'MODIS';

export type JobStatus = 'pending' | 'running' | 'done' | 'failed';

export type SourceBadgeType = 'REAL' | 'ESTIMATE' | 'DEMO' | 'UNAVAILABLE';

export type UseCaseType = 'crop_monitoring' | 'flood_response' | 'general';

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
  band: string;
  snr: number;
  degradation: number;
}

export interface AnalysisReport {
  clarityscore: number; // 0-100
  usable_land_percentage: number;
  cirrus_attenuation_factor: number;
  shadow_impact_score: number;
  downstream_usability_rating: DownstreamUsabilityRating;
  class_distribution: ClassDistribution;
  per_band: PerBandQuality[];
}

export interface GeoBounds {
  type?: 'Polygon' | 'Envelope';
  coordinates?: [number, number][];
  center?: [number, number];
  bbox?: [number, number, number, number] | number[];
  location_name?: string;
  crs?: string;
  resolution_m?: number;
}

export interface STACScene {
  scene_id: string;
  title: string;
  sensor: string;
  datetime: string;
  scene_cloud_cover_pct: number;
  processing_baseline?: string;
  reflectance_offset?: number;
  bbox?: number[];
  thumbnail_url?: string;
  source_badge: SourceBadgeType;
  assets?: Record<string, string | null>;
  days_from_target?: number;
}

export interface UseCaseRanking {
  composite_score: number; // 0 - 100
  usable_pct: number;
  cirrus_share: number;
  shadow_share: number;
  cloud_share: number;
  days_from_target: number;
  date_score: number;
  explanation: string;
}

export interface SCLMetrics {
  usable_pct: number;
  valid_pixels: number;
  total_pixels: number;
  cirrus_share: number;
  shadow_share: number;
  cloud_share: number;
  class_distribution: Record<string, number>;
  class_counts: Record<string, number>;
}

export interface CloudBreakerResult {
  scene_id: string;
  capture_date: string;
  sensor: string;
  tile_id: string;
  processing_baseline: string;
  reflectance_offset: number;
  crs: string;
  resolution_m: number;
  bbox: number[];
  center: [number, number];
  source_badge: SourceBadgeType;
  usable_pct_inside_aoi: number;
  scene_level_cloud_pct: number;
  scl_metrics?: SCLMetrics;
  trust_score_summary?: {
    mean_trust: number;
    min_trust: number;
    max_trust: number;
  };
  ranking?: UseCaseRanking;
  reliable_scene: boolean;
  empty_state_recommendations?: string[];
  mask_url?: string;
  trust_map_url?: string;
  rgb_preview_url?: string;
  source_badges?: Record<string, SourceBadgeType | string>;
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
  progress?: number;
  mask_url?: string;
  trust_map_url?: string;
  rgb_preview_url?: string;
  bounds?: GeoBounds;
  report?: AnalysisReport;
  error_message?: string;
  duration_seconds?: number;
  cloudbreaker_result?: CloudBreakerResult;
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
  engines: Record<string, any>;
  gpu_available?: boolean;
  active_workers?: number;
  timestamp?: string;
}

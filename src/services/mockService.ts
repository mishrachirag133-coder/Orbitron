import { 
  Job, 
  CreateJobPayload, 
  PresignResponse, 
  HealthResponse, 
  AuthResponse 
} from '../types/job';
import { INITIAL_MOCK_JOBS } from '../data/mockJobs';

const STORAGE_KEY_JOBS = 'clarityx_mock_jobs';
const STORAGE_KEY_TOKEN = 'clarityx_auth_token';

// Helper to load jobs from localStorage or defaults
const loadJobsFromStorage = (): Job[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_JOBS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to parse cached mock jobs:', err);
  }
  return [...INITIAL_MOCK_JOBS];
};

const saveJobsToStorage = (jobs: Job[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
  } catch (err) {
    console.warn('Failed to save mock jobs to localStorage:', err);
  }
};

let memoryJobs: Job[] = loadJobsFromStorage();

// Progress runner to simulate background cloud masking jobs
setInterval(() => {
  let changed = false;
  memoryJobs = memoryJobs.map((job) => {
    if (job.status === 'pending') {
      changed = true;
      return {
        ...job,
        status: 'running',
        progress: 25,
        updated_at: new Date().toISOString()
      };
    }
    if (job.status === 'running') {
      const currentProgress = job.progress || 25;
      if (currentProgress < 90) {
        changed = true;
        return {
          ...job,
          progress: currentProgress + 20,
          updated_at: new Date().toISOString()
        };
      } else {
        changed = true;
        // Complete the job with realistic report
        const clarity = Math.round(75 + Math.random() * 22);
        return {
          ...job,
          status: 'done',
          progress: 100,
          duration_seconds: (job.duration_seconds || 45) + 15,
          rgb_preview_url: job.rgb_preview_url || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1600&q=80',
          mask_url: job.mask_url || 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1600&q=80',
          bounds: job.bounds || {
            location_name: 'Processed AOI Quadrangle',
            crs: 'EPSG:4326',
            resolution_m: 10,
            center: [37.7749, -122.4194],
            bbox: [-122.5, 37.7, -122.3, 37.85],
            coordinates: [
              [-122.5, 37.7],
              [-122.3, 37.7],
              [-122.3, 37.85],
              [-122.5, 37.85],
              [-122.5, 37.7]
            ]
          },
          report: job.report || {
            clarityscore: clarity,
            usable_land_percentage: Number((clarity * 0.95).toFixed(1)),
            cirrus_attenuation_factor: Number(((100 - clarity) * 0.005).toFixed(2)),
            shadow_impact_score: Number((Math.random() * 8 + 2).toFixed(1)),
            downstream_usability_rating: {
              ndvi: Math.min(100, Math.round(clarity + 4)),
              building_seg: Math.min(100, Math.round(clarity - 2)),
              change_detection: Math.min(100, Math.round(clarity + 2))
            },
            class_distribution: {
              clear: Number((clarity * 0.88).toFixed(1)),
              thick_cloud: Number(((100 - clarity) * 0.55).toFixed(1)),
              thin_cirrus: Number(((100 - clarity) * 0.30).toFixed(1)),
              shadow: Number(((100 - clarity) * 0.15).toFixed(1))
            },
            per_band: [
              { band: 'B1 (Coastal)', snr: 38.2, degradation: 11.2 },
              { band: 'B2 (Blue)', snr: 44.5, degradation: 9.3 },
              { band: 'B3 (Green)', snr: 48.0, degradation: 7.1 },
              { band: 'B4 (Red)', snr: 52.4, degradation: 5.5 },
              { band: 'B8 (NIR)', snr: 56.1, degradation: 3.8 },
              { band: 'B11 (SWIR)', snr: 49.3, degradation: 6.4 }
            ]
          },
          updated_at: new Date().toISOString()
        };
      }
    }
    return job;
  });

  if (changed) {
    saveJobsToStorage(memoryJobs);
  }
}, 4000);

export const mockBackend = {
  async login(credentials: { email?: string; password?: string; apiKey?: string }): Promise<AuthResponse> {
    await new Promise((r) => setTimeout(r, 450));
    const token = 'cx_jwt_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    return {
      access_token: token,
      token_type: 'bearer',
      user: {
        email: credentials.email || 'operator@clarityx.ai',
        organization: 'Orbital Geospatial Systems Lab',
        role: credentials.apiKey ? 'API Service Account' : 'Senior Remote Sensing Engineer'
      }
    };
  },

  async getPresignUrl(filename: string): Promise<PresignResponse> {
    await new Promise((r) => setTimeout(r, 300));
    const key = `uploads/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${Date.now()}_${filename.replace(/\s+/g, '_')}`;
    return {
      upload_url: `https://clarityx-prod-imagery-us-west-2.s3.amazonaws.com/${key}?X-Amz-Signature=mock-sig-${Date.now()}`,
      s3_key: key
    };
  },

  async simulateS3Upload(url: string, file: File, onProgress?: (pct: number) => void): Promise<void> {
    // Simulates direct binary PUT to S3 with real progress feedback
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
      await new Promise((r) => setTimeout(r, 120));
      if (onProgress) {
        onProgress(Math.min(100, Math.round((i / steps) * 100)));
      }
    }
  },

  async createJob(payload: CreateJobPayload): Promise<{ job_id: string }> {
    await new Promise((r) => setTimeout(r, 500));
    const newId = `job-cx-${Math.floor(10000 + Math.random() * 90000)}-${payload.sensor.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    
    // Choose sensible preview coordinates based on sensor or random plausible bounds
    const newJob: Job = {
      job_id: newId,
      s3_key: payload.s3_key,
      sensor: payload.sensor,
      engine: payload.engine,
      filename: payload.filename || payload.s3_key.split('/').pop() || 'satellite_scene.tif',
      file_size_mb: payload.file_size_mb || 340.5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'pending',
      progress: 5,
      bounds: {
        location_name: `${payload.sensor} Target AOI Tile`,
        crs: 'EPSG:4326',
        resolution_m: payload.sensor.includes('WorldView') ? 0.3 : payload.sensor.includes('Planet') ? 3 : 10,
        center: [37.7749, -122.4194],
        bbox: [-122.55, 37.7, -122.3, 37.85],
        coordinates: [
          [-122.55, 37.7],
          [-122.3, 37.7],
          [-122.3, 37.85],
          [-122.55, 37.85],
          [-122.55, 37.7]
        ]
      }
    };

    memoryJobs = [newJob, ...memoryJobs];
    saveJobsToStorage(memoryJobs);
    return { job_id: newId };
  },

  async getJobs(): Promise<Job[]> {
    await new Promise((r) => setTimeout(r, 200));
    return [...memoryJobs];
  },

  async getJobById(id: string): Promise<Job> {
    await new Promise((r) => setTimeout(r, 200));
    const found = memoryJobs.find((j) => j.job_id === id);
    if (!found) {
      throw new Error(`Job ${id} not found`);
    }
    return { ...found };
  },

  async getHealth(): Promise<HealthResponse> {
    await new Promise((r) => setTimeout(r, 150));
    return {
      status: 'healthy',
      version: 'v2.4.0-cloudmask-ai',
      engines: {
        fast_onnx: true,
        deep_transformer: true
      },
      gpu_available: true,
      active_workers: 8,
      timestamp: new Date().toISOString()
    };
  },

  resetDefaults() {
    memoryJobs = [...INITIAL_MOCK_JOBS];
    saveJobsToStorage(memoryJobs);
    return memoryJobs;
  }
};

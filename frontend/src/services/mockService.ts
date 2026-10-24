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
  },

  async searchScenes(payload: any) {
    await new Promise((r) => setTimeout(r, 300));
    const scenes = [
      {
        scene_id: "S2A_MSIL2A_20240712T164841_N0511_R069_T15TVH_DEMO",
        title: "Iowa Corn Belt Field AOI (Crop Monitoring)",
        sensor: "Sentinel-2 L2A",
        datetime: "2024-07-12T16:48:41Z",
        scene_cloud_cover_pct: 34.2,
        processing_baseline: "05.11",
        reflectance_offset: -1000,
        bbox: [-93.65, 41.55, -93.58, 41.62],
        thumbnail_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80",
        source_badge: "DEMO"
      },
      {
        scene_id: "S2B_MSIL2A_20240608T103619_N0510_R008_T32ULA_DEMO",
        title: "Rhine Valley Floodplain AOI (Flood Response)",
        sensor: "Sentinel-2 L2A",
        datetime: "2024-06-08T10:36:19Z",
        scene_cloud_cover_pct: 48.0,
        processing_baseline: "05.10",
        reflectance_offset: -1000,
        bbox: [7.55, 50.32, 7.64, 50.38],
        thumbnail_url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80",
        source_badge: "DEMO"
      },
      {
        scene_id: "S2A_MSIL2A_20240114T185731_N0510_R113_T10SEG_DEMO",
        title: "San Francisco Bay Coastal AOI (General)",
        sensor: "Sentinel-2 L2A",
        datetime: "2024-01-14T18:57:31Z",
        scene_cloud_cover_pct: 52.8,
        processing_baseline: "05.10",
        reflectance_offset: -1000,
        bbox: [-122.45, 37.75, -122.38, 37.81],
        thumbnail_url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=400&q=80",
        source_badge: "DEMO"
      },
      {
        scene_id: "S2B_MSIL2A_20240728T053649_N0511_R019_T43KDA_DEMO",
        title: "Mumbai Monsoon Coastal Basin (Honest Empty State)",
        sensor: "Sentinel-2 L2A",
        datetime: "2024-07-28T05:36:49Z",
        scene_cloud_cover_pct: 98.4,
        processing_baseline: "05.11",
        reflectance_offset: -1000,
        bbox: [72.82, 18.95, 72.92, 19.05],
        thumbnail_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80",
        source_badge: "DEMO"
      }
    ];
    return {
      aoi_bbox: payload.aoi?.bbox || [-122.45, 37.75, -122.38, 37.81],
      total_scenes_found: scenes.length,
      scenes,
      source: "Offline Cached STAC Benchmark Catalog",
      notice: "Scene cloud % represents full 100km tile. Run analysis to compute exact AOI window usability."
    };
  },

  async analyzeAOI(payload: any) {
    await new Promise((r) => setTimeout(r, 400));
    const newId = `cb-demo-${Math.floor(1000 + Math.random() * 9000)}`;
    const isMumbai = payload.scene_id.includes("Mumbai") || payload.scene_id.includes("T43KDA");
    const usable = isMumbai ? 0.8 : 84.6;

    const newJob: Job = {
      job_id: newId,
      s3_key: `s2/${payload.scene_id}`,
      filename: payload.scene_id,
      sensor: "Sentinel-2 L2A",
      engine: "deep",
      created_at: new Date().toISOString(),
      status: "done",
      progress: 100,
      duration_seconds: 4,
      rgb_preview_url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1600&q=80",
      mask_url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1600&q=80",
      bounds: {
        location_name: "Selected AOI Field Window",
        crs: "EPSG:32610",
        resolution_m: 10,
        center: [37.7749, -122.4194],
        bbox: payload.aoi?.bbox || [-122.45, 37.75, -122.38, 37.81]
      },
      report: {
        clarityscore: usable,
        usable_land_percentage: usable,
        cirrus_attenuation_factor: isMumbai ? 0.72 : 0.08,
        shadow_impact_score: isMumbai ? 22.4 : 3.8,
        downstream_usability_rating: {
          ndvi: isMumbai ? 12.0 : 92.5,
          building_seg: isMumbai ? 8.0 : 88.0,
          change_detection: isMumbai ? 15.0 : 94.2
        },
        class_distribution: isMumbai ? {
          clear: 0.8,
          thick_cloud: 88.2,
          thin_cirrus: 7.2,
          shadow: 3.8
        } : {
          clear: 84.6,
          thick_cloud: 4.8,
          thin_cirrus: 7.2,
          shadow: 3.4
        },
        per_band: [
          { band: "B2 (Blue)", snr: 41.5, degradation: isMumbai ? 85.0 : 12.3 },
          { band: "B3 (Green)", snr: 46.1, degradation: isMumbai ? 80.0 : 8.7 },
          { band: "B4 (Red)", snr: 49.8, degradation: isMumbai ? 78.0 : 6.1 },
          { band: "B8 (NIR)", snr: 55.4, degradation: isMumbai ? 72.0 : 4.1 },
          { band: "B11 (SWIR)", snr: 48.3, degradation: isMumbai ? 65.0 : 7.2 }
        ]
      }
    };

    memoryJobs = [newJob, ...memoryJobs];
    saveJobsToStorage(memoryJobs);

    return {
      job_id: newId,
      status: "pending",
      message: "Analysis dispatched."
    };
  },

  async getResults(jobId: string) {
    await new Promise((r) => setTimeout(r, 200));
    const job = memoryJobs.find((j) => j.job_id === jobId) || memoryJobs[0];
    const isMumbai = job.filename?.includes("Mumbai") || (job.report?.usable_land_percentage || 0) < 25;
    const usable = job.report?.usable_land_percentage || 84.6;

    return {
      scene_id: job.filename || "S2A_MSIL2A_DEMO",
      capture_date: job.created_at,
      sensor: "Sentinel-2 L2A",
      tile_id: "T10SEG",
      processing_baseline: "05.10",
      reflectance_offset: -1000,
      crs: job.bounds?.crs || "EPSG:32610",
      resolution_m: 10,
      bbox: job.bounds?.bbox || [-122.45, 37.75, -122.38, 37.81],
      center: job.bounds?.center || [37.7749, -122.4194],
      source_badge: "DEMO",
      usable_pct_inside_aoi: usable,
      scene_level_cloud_pct: 48.5,
      trust_score_summary: {
        mean_trust: Number((usable / 100.0).toFixed(3)),
        min_trust: isMumbai ? 0.0 : 0.15,
        max_trust: 1.0
      },
      ranking: {
        composite_score: usable,
        usable_pct: usable,
        cirrus_share: job.report?.cirrus_attenuation_factor ? job.report.cirrus_attenuation_factor * 100 : 8.0,
        shadow_share: job.report?.shadow_impact_score || 4.0,
        cloud_share: 100 - usable,
        days_from_target: 0,
        date_score: 100,
        explanation: isMumbai 
          ? "Severely obstructed AOI (0.8% clear); 88.2% thick convective clouds across field footprint." 
          : `High AOI usability (${usable}% clear surface inside field window). Clearer than 100km tile average (48.5% cloud).`
      },
      reliable_scene: usable >= 25.0,
      empty_state_recommendations: usable < 25.0 ? [
        "High persistent monsoon cloud veil across target AOI (>75% obscured).",
        "Recommendation 1: Broaden temporal search window by 2 to 4 weeks.",
        "Recommendation 2: Switch to Sentinel-1 Synthetic Aperture Radar (SAR) for cloud-penetrating water/flood extent detection."
      ] : [],
      mask_url: job.mask_url,
      trust_map_url: job.trust_map_url || job.mask_url,
      rgb_preview_url: job.rgb_preview_url,
      source_badges: {
        usable_pct_inside_aoi: "DEMO",
        scene_level_cloud_pct: "DEMO",
        trust_score: "DEMO",
        downstream_ratings: "ESTIMATE",
        disclaimer: "decision support, not an official warning system"
      }
    };
  },

  async getExportReport(jobId: string) {
    await new Promise((r) => setTimeout(r, 150));
    return {
      report_id: `REP-CB-${jobId}`,
      generated_at: new Date().toISOString(),
      software: "Cloud Breaker Intelligence Engine",
      methodology: {
        name: "Cloud Breaker AOI Window SCL & Trust Matrix Fusion",
        version: "1.0.0-hackathon-release",
        scl_classes_defined: 12,
        clear_surface_classes: [4, 5, 6, 11],
        cirrus_penalty_weight: 0.8,
        shadow_penalty_weight: 1.2
      },
      stac_item: {
        id: "S2A_MSIL2A_DEMO",
        collection: "sentinel-2-l2a",
        provider: "Microsoft Planetary Computer / Copernicus Data Space",
        processing_baseline: "05.10",
        reflectance_offset_applied: -1000,
        offset_explanation: "ESA Sentinel-2 baseline 04.00+ applies -1000 DN radiometric offset to surface reflectance."
      },
      aoi_metrics: {
        usable_pixel_percentage: 84.6
      },
      provenance: {
        usable_pct_source: "DEMO",
        trust_score_source: "DEMO",
        license: "Creative Commons Attribution 4.0 International (CC BY 4.0)"
      },
      disclaimer: "Decision support, not an official warning system."
    };
  }
};

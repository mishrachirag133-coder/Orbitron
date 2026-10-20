import axios, { AxiosInstance, AxiosProgressEvent } from 'axios';
import { 
  Job, 
  CreateJobPayload, 
  PresignResponse, 
  HealthResponse, 
  AuthResponse 
} from '../types/job';
import { mockBackend } from './mockService';

const ENV_API_URL = import.meta.env.VITE_API_URL;
const STORAGE_KEY_TOKEN = 'clarityx_auth_token';
const STORAGE_KEY_FORCE_MOCK = 'clarityx_force_mock';

export const isForceMockMode = (): boolean => {
  const val = localStorage.getItem(STORAGE_KEY_FORCE_MOCK);
  // Default to mock mode if no VITE_API_URL is configured
  if (val === null) {
    return !ENV_API_URL;
  }
  return val === 'true';
};

export const setForceMockMode = (forced: boolean) => {
  localStorage.setItem(STORAGE_KEY_FORCE_MOCK, forced ? 'true' : 'false');
  window.dispatchEvent(new Event('clarityx_mock_mode_changed'));
};

const axiosClient: AxiosInstance = axios.create({
  baseURL: ENV_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEY_TOKEN);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  getAuthToken(): string | null {
    return localStorage.getItem(STORAGE_KEY_TOKEN);
  },

  setAuthToken(token: string) {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
  },

  clearAuthToken() {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  },

  // POST /auth/login -> { access_token }
  async login(payload: { email?: string; password?: string; apiKey?: string }): Promise<AuthResponse> {
    if (isForceMockMode()) {
      const res = await mockBackend.login(payload);
      this.setAuthToken(res.access_token);
      return res;
    }

    try {
      const res = await axiosClient.post<AuthResponse>('/auth/login', payload);
      if (res.data?.access_token) {
        this.setAuthToken(res.data.access_token);
      }
      return res.data;
    } catch (err) {
      console.warn('Real API login failed, falling back to mock mode:', err);
      const res = await mockBackend.login(payload);
      this.setAuthToken(res.access_token);
      return res;
    }
  },

  // GET /uploads/presign -> { upload_url, s3_key }
  async getPresignUrl(filename: string): Promise<PresignResponse> {
    if (isForceMockMode()) {
      return mockBackend.getPresignUrl(filename);
    }

    try {
      const res = await axiosClient.get<PresignResponse>('/uploads/presign', {
        params: { filename }
      });
      return res.data;
    } catch (err) {
      console.warn('Real API presign failed, falling back to mock mode:', err);
      return mockBackend.getPresignUrl(filename);
    }
  },

  // Upload file directly to S3 via presigned URL
  async uploadFileToS3(uploadUrl: string, file: File, onProgress?: (pct: number) => void): Promise<void> {
    if (isForceMockMode() || uploadUrl.includes('mock-sig')) {
      return mockBackend.simulateS3Upload(uploadUrl, file, onProgress);
    }

    try {
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type || 'image/tiff',
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
      });
    } catch (err) {
      console.warn('S3 direct upload failed, simulating completion:', err);
      return mockBackend.simulateS3Upload(uploadUrl, file, onProgress);
    }
  },

  // POST /jobs -> body { s3_key, sensor, engine: "fast"|"deep" } -> { job_id }
  async createJob(payload: CreateJobPayload): Promise<{ job_id: string }> {
    if (isForceMockMode()) {
      return mockBackend.createJob(payload);
    }

    try {
      const res = await axiosClient.post<{ job_id: string }>('/jobs', payload);
      return res.data;
    } catch (err) {
      console.warn('Real API createJob failed, falling back to mock mode:', err);
      return mockBackend.createJob(payload);
    }
  },

  // GET /jobs -> list of jobs
  async getJobs(): Promise<Job[]> {
    if (isForceMockMode()) {
      return mockBackend.getJobs();
    }

    try {
      const res = await axiosClient.get<Job[]>('/jobs');
      return res.data;
    } catch (err) {
      console.warn('Real API getJobs failed, falling back to mock mode:', err);
      return mockBackend.getJobs();
    }
  },

  // GET /jobs/{id} -> job details with mask_url, rgb_preview_url, bounds, report
  async getJobById(id: string): Promise<Job> {
    if (isForceMockMode()) {
      return mockBackend.getJobById(id);
    }

    try {
      const res = await axiosClient.get<Job>(`/jobs/${id}`);
      return res.data;
    } catch (err) {
      console.warn(`Real API getJobById(${id}) failed, falling back to mock:`, err);
      return mockBackend.getJobById(id);
    }
  },

  // GET /health
  async getHealth(): Promise<HealthResponse> {
    if (isForceMockMode()) {
      return mockBackend.getHealth();
    }

    try {
      const res = await axiosClient.get<HealthResponse>('/health');
      return res.data;
    } catch (err) {
      console.warn('Real API getHealth failed, falling back to mock:', err);
      return mockBackend.getHealth();
    }
  },
};

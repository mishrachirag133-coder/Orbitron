from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field

class LoginPayload(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    apiKey: Optional[str] = None

class UserInfo(BaseModel):
    email: str
    organization: Optional[str] = "ClarityX Satellite Operations"
    role: Optional[str] = "Analyst"

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    user: UserInfo

class DownstreamUsabilityRating(BaseModel):
    ndvi: float
    building_seg: float
    change_detection: float

class ClassDistribution(BaseModel):
    clear: float
    thick_cloud: float
    thin_cirrus: float
    shadow: float

class PerBandQuality(BaseModel):
    band: str
    snr: float
    degradation: float

class AnalysisReport(BaseModel):
    clarityscore: float
    usable_land_percentage: float
    cirrus_attenuation_factor: float
    shadow_impact_score: float
    downstream_usability_rating: DownstreamUsabilityRating
    class_distribution: ClassDistribution
    per_band: List[PerBandQuality]

class GeoBounds(BaseModel):
    type: Optional[str] = "Envelope"
    coordinates: Optional[List[List[float]]] = None
    center: Optional[List[float]] = None
    bbox: Optional[List[float]] = None
    location_name: Optional[str] = None
    crs: Optional[str] = None
    resolution_m: Optional[float] = None

class Job(BaseModel):
    job_id: str
    s3_key: str
    sensor: str
    engine: str = "deep"
    created_at: str
    updated_at: Optional[str] = None
    filename: Optional[str] = None
    file_size_mb: Optional[float] = None
    status: str = "done"  # 'pending' | 'running' | 'done' | 'failed'
    progress: Optional[int] = 100
    mask_url: Optional[str] = None
    rgb_preview_url: Optional[str] = None
    bounds: Optional[GeoBounds] = None
    report: Optional[AnalysisReport] = None
    error_message: Optional[str] = None
    duration_seconds: Optional[int] = None

class CreateJobPayload(BaseModel):
    s3_key: str
    sensor: str = "Sentinel-2"
    engine: str = "deep"
    filename: Optional[str] = None
    file_size_mb: Optional[float] = None

class CreateJobResponse(BaseModel):
    job_id: str

class PresignResponse(BaseModel):
    upload_url: str
    s3_key: str

class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str = "1.0.0"
    engines: Dict[str, str] = {
        "fast": "active",
        "deep": "active"
    }

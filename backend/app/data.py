import datetime
import random
from typing import List, Dict, Optional
from app.models import Job, AnalysisReport, ClassDistribution, DownstreamUsabilityRating, PerBandQuality, GeoBounds

INITIAL_JOBS: List[Dict] = [
    {
        "job_id": "job-cx-88219-sentinel",
        "s3_key": "uploads/2026/10/S2B_MSIL2A_SanFrancisco_T10SEG.tif",
        "filename": "S2B_MSIL2A_SanFrancisco_T10SEG.tif",
        "sensor": "Sentinel-2",
        "engine": "deep",
        "created_at": "2026-10-19T14:32:10Z",
        "updated_at": "2026-10-19T14:33:45Z",
        "file_size_mb": 482.4,
        "status": "done",
        "progress": 100,
        "duration_seconds": 95,
        "rgb_preview_url": "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1600&q=80",
        "mask_url": "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1600&q=80",
        "bounds": {
            "location_name": "San Francisco Bay & Silicon Valley, California, USA",
            "crs": "EPSG:32610 (UTM Zone 10N)",
            "resolution_m": 10.0,
            "center": [37.7749, -122.4194],
            "bbox": [-122.54, 37.68, -122.25, 37.89],
            "coordinates": [
                [-122.54, 37.68],
                [-122.25, 37.68],
                [-122.25, 37.89],
                [-122.54, 37.89],
                [-122.54, 37.68]
            ]
        },
        "report": {
            "clarityscore": 87.4,
            "usable_land_percentage": 84.6,
            "cirrus_attenuation_factor": 0.14,
            "shadow_impact_score": 6.2,
            "downstream_usability_rating": {
                "ndvi": 92.5,
                "building_seg": 88.0,
                "change_detection": 94.2
            },
            "class_distribution": {
                "clear": 78.4,
                "thick_cloud": 9.3,
                "thin_cirrus": 7.8,
                "shadow": 4.5
            },
            "per_band": [
                {"band": "B1 (Coastal)", "snr": 34.2, "degradation": 14.8},
                {"band": "B2 (Blue)", "snr": 41.5, "degradation": 12.3},
                {"band": "B3 (Green)", "snr": 46.1, "degradation": 8.7},
                {"band": "B4 (Red)", "snr": 49.8, "degradation": 6.1},
                {"band": "B5 (RedEdge-1)", "snr": 51.2, "degradation": 5.4},
                {"band": "B6 (RedEdge-2)", "snr": 52.8, "degradation": 4.9},
                {"band": "B7 (RedEdge-3)", "snr": 53.6, "degradation": 4.6},
                {"band": "B8 (NIR-Broad)", "snr": 55.4, "degradation": 4.1},
                {"band": "B8A (NIR-Narrow)", "snr": 54.9, "degradation": 4.3},
                {"band": "B9 (Cirrus)", "snr": 22.8, "degradation": 38.5},
                {"band": "B11 (SWIR-1)", "snr": 48.3, "degradation": 7.2},
                {"band": "B12 (SWIR-2)", "snr": 45.6, "degradation": 8.9}
            ]
        }
    },
    {
        "job_id": "job-cx-90142-landsat",
        "s3_key": "uploads/2026/10/LC09_L1TP_Amazonas_TowerCluster.tif",
        "filename": "LC09_Amazonas_TowerCluster.tif",
        "sensor": "Landsat-8/9",
        "engine": "deep",
        "created_at": "2026-10-18T10:14:22Z",
        "updated_at": "2026-10-18T10:16:05Z",
        "file_size_mb": 890.1,
        "status": "done",
        "progress": 100,
        "duration_seconds": 103,
        "rgb_preview_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80",
        "mask_url": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80",
        "bounds": {
            "location_name": "Amazon Basin Dense Canopy, Amazonas, Brazil",
            "crs": "EPSG:32720 (UTM Zone 20S)",
            "resolution_m": 30.0,
            "center": [-3.4653, -62.2159],
            "bbox": [-62.4, -3.6, -62.0, -3.3],
            "coordinates": [
                [-62.4, -3.6],
                [-62.0, -3.6],
                [-62.0, -3.3],
                [-62.4, -3.3],
                [-62.4, -3.6]
            ]
        },
        "report": {
            "clarityscore": 52.8,
            "usable_land_percentage": 50.1,
            "cirrus_attenuation_factor": 0.42,
            "shadow_impact_score": 18.2,
            "downstream_usability_rating": {
                "ndvi": 58.0,
                "building_seg": 32.5,
                "change_detection": 64.0
            },
            "class_distribution": {
                "clear": 46.2,
                "thick_cloud": 32.4,
                "thin_cirrus": 8.5,
                "shadow": 12.9
            },
            "per_band": [
                {"band": "B1 (Coastal Aerosol)", "snr": 28.5, "degradation": 24.1},
                {"band": "B2 (Blue)", "snr": 32.0, "degradation": 21.3},
                {"band": "B3 (Green)", "snr": 36.2, "degradation": 16.5},
                {"band": "B4 (Red)", "snr": 39.4, "degradation": 14.2},
                {"band": "B5 (NIR)", "snr": 42.1, "degradation": 11.0},
                {"band": "B6 (SWIR-1)", "snr": 40.5, "degradation": 12.8},
                {"band": "B7 (SWIR-2)", "snr": 38.0, "degradation": 14.5},
                {"band": "B9 (Cirrus)", "snr": 18.2, "degradation": 49.2}
            ]
        }
    },
    {
        "job_id": "job-cx-94301-planet",
        "s3_key": "uploads/2026/10/PS_SuperDove_Tokyo_Harbor.tif",
        "filename": "PS_SuperDove_Tokyo_Harbor.tif",
        "sensor": "PlanetScope",
        "engine": "fast",
        "created_at": "2026-10-17T08:05:40Z",
        "updated_at": "2026-10-17T08:06:12Z",
        "file_size_mb": 215.8,
        "status": "done",
        "progress": 100,
        "duration_seconds": 32,
        "rgb_preview_url": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80",
        "mask_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
        "bounds": {
            "location_name": "Tokyo Port & Waterfront Metropolis, Japan",
            "crs": "EPSG:32654 (UTM Zone 54N)",
            "resolution_m": 3.0,
            "center": [35.6762, 139.6503],
            "bbox": [139.55, 35.58, 139.75, 35.75],
            "coordinates": [
                [139.55, 35.58],
                [139.75, 35.58],
                [139.75, 35.75],
                [139.55, 35.75],
                [139.55, 35.58]
            ]
        },
        "report": {
            "clarityscore": 96.1,
            "usable_land_percentage": 97.4,
            "cirrus_attenuation_factor": 0.05,
            "shadow_impact_score": 1.2,
            "downstream_usability_rating": {
                "ndvi": 89.2,
                "building_seg": 98.4,
                "change_detection": 97.8
            },
            "class_distribution": {
                "clear": 96.2,
                "thick_cloud": 0.8,
                "thin_cirrus": 1.8,
                "shadow": 1.2
            },
            "per_band": [
                {"band": "Coastal Blue", "snr": 44.0, "degradation": 5.1},
                {"band": "Blue", "snr": 52.1, "degradation": 3.8},
                {"band": "Green-I", "snr": 56.4, "degradation": 2.5},
                {"band": "Green", "snr": 57.0, "degradation": 2.2},
                {"band": "Yellow", "snr": 58.2, "degradation": 2.0},
                {"band": "Red", "snr": 61.5, "degradation": 1.8},
                {"band": "RedEdge", "snr": 60.8, "degradation": 1.9},
                {"band": "NIR", "snr": 63.4, "degradation": 1.5}
            ]
        }
    }
]

class JobsDatabase:
    def __init__(self):
        self.jobs: Dict[str, dict] = {j["job_id"]: j for j in INITIAL_JOBS}

    def list_jobs(self) -> List[dict]:
        return list(self.jobs.values())

    def get_job(self, job_id: str) -> Optional[dict]:
        return self.jobs.get(job_id)

    def update_job(self, job_id: str, updates: dict) -> Optional[dict]:
        if job_id not in self.jobs:
            self.jobs[job_id] = {"job_id": job_id}
        self.jobs[job_id].update(updates)
        self.jobs[job_id]["updated_at"] = datetime.datetime.utcnow().isoformat() + "Z"
        return self.jobs[job_id]

    def add_job(self, payload: dict) -> dict:
        job_id = f"job-cx-{random.randint(10000, 99999)}-{payload.get('sensor', 'scene').lower().split('-')[0]}"
        now = datetime.datetime.utcnow().isoformat() + "Z"
        
        clarity = round(random.uniform(78.0, 96.5), 1)
        clear_pct = round(clarity * 0.95, 1)
        thick = round(random.uniform(1.0, 8.0), 1)
        cirrus = round(random.uniform(2.0, 6.0), 1)
        shadow = round(max(0.5, 100.0 - clear_pct - thick - cirrus), 1)

        new_job = {
            "job_id": job_id,
            "s3_key": payload.get("s3_key", f"uploads/{payload.get('filename', 'scene.tif')}"),
            "filename": payload.get("filename", "custom_satellite_scene.tif"),
            "sensor": payload.get("sensor", "Sentinel-2"),
            "engine": payload.get("engine", "deep"),
            "created_at": now,
            "updated_at": now,
            "file_size_mb": payload.get("file_size_mb", 420.5),
            "status": "done",
            "progress": 100,
            "duration_seconds": random.randint(30, 85),
            "rgb_preview_url": "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1600&q=80",
            "mask_url": "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1600&q=80",
            "bounds": {
                "location_name": "Target AOI Region",
                "crs": "EPSG:4326 (WGS 84)",
                "resolution_m": 10.0,
                "center": [37.7749, -122.4194],
                "bbox": [-122.5, 37.7, -122.3, 37.9],
                "coordinates": [
                    [-122.5, 37.7],
                    [-122.3, 37.7],
                    [-122.3, 37.9],
                    [-122.5, 37.9],
                    [-122.5, 37.7]
                ]
            },
            "report": {
                "clarityscore": clarity,
                "usable_land_percentage": clear_pct,
                "cirrus_attenuation_factor": round(cirrus / 50.0, 2),
                "shadow_impact_score": shadow,
                "downstream_usability_rating": {
                    "ndvi": round(random.uniform(80.0, 95.0), 1),
                    "building_seg": round(random.uniform(75.0, 96.0), 1),
                    "change_detection": round(random.uniform(82.0, 97.0), 1)
                },
                "class_distribution": {
                    "clear": clear_pct,
                    "thick_cloud": thick,
                    "thin_cirrus": cirrus,
                    "shadow": shadow
                },
                "per_band": [
                    {"band": "B1", "snr": 38.0, "degradation": 10.2},
                    {"band": "B2", "snr": 42.5, "degradation": 8.1},
                    {"band": "B3", "snr": 48.0, "degradation": 5.4},
                    {"band": "B4", "snr": 51.2, "degradation": 4.2},
                    {"band": "B8", "snr": 56.0, "degradation": 3.1}
                ]
            }
        }

        self.jobs[job_id] = new_job
        return new_job

db = JobsDatabase()

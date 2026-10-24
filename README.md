# Cloud Breaker 🛰️⚡
### *Quality-First Intelligence Layer for Sentinel-2 L2A Satellite Imagery*
**Orbiton Hackathon — Open Innovation Track**

> **Mandatory Disclaimer:** Cloud Breaker is an analytical **decision-support tool, not an official warning system**. All metrics, masks, and trust scores are calculated for scientific guidance and exploratory filtering.

---

## 🌟 The Problem & The Cloud Breaker Solution

### The Satellite Cloud Trap
Satellite imagery is abundant, but clouds, thin cirrus, and terrain shadows make a huge proportion of optical scenes unusable. Downstream users face two critical problems:
1. **The 100 km Tile Lie**: Catalog search engines only report scene-level cloud cover for an entire $10,000\text{ km}^2$ tile (e.g., `"Cloud Cover: 68%"`). An agricultural field or flooded valley inside that tile might be completely clear—or conversely, a `"10% Cloud"` tile might have clouds directly over the user's 500-hectare Area of Interest (AOI).
2. **Mask Fragility & Disagreement**: Existing cloud masks (ESA SCL, s2cloudless, Cloud Score+) disagree and frequently fail on snow, bright roofs, thin cirrus, and topographic shadows.

### The Cloud Breaker Approach
**Cloud Breaker is NOT another cloud detector.** It is a **quality-first intelligence layer** on top of existing satellite cloud masks that quantifies trustworthiness specifically inside the user's AOI window:
- **Zero-Download Windowed COG Reads**: Streams *only* the specific pixels inside the user's AOI bounding box using Cloud-Optimized GeoTIFF (COG) HTTP range requests. Never downloads 500MB full tiles.
- **AOI Usable Area Calculation**: Computes the exact percentage of valid, high-trust land/water inside the field boundaries versus the tile average.
- **Continuous Per-Pixel Trust Matrix (0.0 to 1.0)**: Combines SCL spectral classification, cirrus transparency, and shadow penalties into an interactive spatial heatmap.
- **Use-Case Explainable Ranking**: Ranks candidate scenes specifically for *Crop Monitoring*, *Flood Response*, or *General Remote Sensing* with transparent mathematical score breakdowns.
- **Honest Empty State**: When an area is shrouded in persistent clouds (e.g., monsoon basins), Cloud Breaker warns the user with actionable next steps rather than presenting unreliable data.
- **Data Provenance Badges**: Every single metric is badged `REAL`, `ESTIMATE`, `DEMO`, or `UNAVAILABLE`.

---

## 📋 Feature Status & Checklist

| # | Feature Requirement | Status | Implementation Details |
|---|---------------------|:------:|------------------------|
| 1 | **AOI Selection + Date + Use-Case** | ✅ **DONE** | Interactive Leaflet AOI bounding box selector, preset quick-fills (Iowa, Rhine, SF, Mumbai), date pickers, use-case selector (`crop_monitoring`, `flood_response`, `general`). |
| 2 | **STAC Sentinel-2 L2A Search** | ✅ **DONE** | `POST /api/search` queries Microsoft Planetary Computer STAC API (`sentinel-2-l2a`) with automatic token signing (`planetary-computer`) and fallback to demo bundle. |
| 3 | **Baseline SCL Mask Window Reads** | ✅ **DONE** | Reads only AOI window bounding box via `rasterio.windows.from_bounds` with EPSG:4326 $\to$ UTM CRS coordinate transformation. Decodes all 12 SCL classes (0–11). |
| 4 | **AOI Usable % Computation** | ✅ **DONE** | Calculates valid non-cloud, non-shadow, non-saturated pixel percentage inside AOI boundary. Contrasted against 100km tile average in UI. |
| 5 | **Per-Pixel Trust Score (0.0 to 1.0)** | ✅ **DONE** | Raster trust calculation factoring SCL classes, cirrus degradation, shadow penalties, and use-case affinity. Visualized via dynamic Canvas overlay with legend. |
| 6 | **Use-Case Scene Ranking** | ✅ **DONE** | Explainable composite score factoring usable %, cirrus penalty, shadow penalty, and temporal proximity. Provides plain-English explanation. |
| 7 | **Before / After Map View** | ✅ **DONE** | Interactive dual-layer map viewer with split-screen comparison slider, opacity blending, and toggle between SCL mask and Trust heatmap. |
| 8 | **Reproducible JSON Report Export** | ✅ **DONE** | `GET /api/export/{id}` exports full JSON audit report with scene IDs, processing baseline, DN offset, algorithm version, and timestamp. |
| 9 | **Honest Empty State** | ✅ **DONE** | When AOI usable % is below threshold (<25%), flags scene as low reliability, triggers UI warning banner, and suggests alternative dates/SAR options. |
| 10 | **Source Badges** | ✅ **DONE** | `SourceBadge` component renders `REAL`, `ESTIMATE`, `DEMO`, and `UNAVAILABLE` badges on every metric card, map layer, and ranking table. |
| 11 | **Offline DEMO Bundle** | ✅ **DONE** | Built-in offline demo bundle featuring 4 benchmark scenes (Iowa Corn Belt, Rhine Floodplain, San Francisco Bay, Mumbai Monsoon) for 100% resilient offline demos. |
| 12 | **Method Incompatibility Blocking** | ✅ **DONE** | Blocks incompatible algorithms (e.g., `s2cloudless` on L2A surface reflectance) with HTTP 400 error and scientific explanation. Reads processing baseline & offset (`-1000` DN for baseline $\ge$ 04.00). |

---

## 🏗️ Architecture & Tech Stack

```
                   ┌──────────────────────────────────────────────┐
                   │               Cloud Breaker UI               │
                   │      React 18 + Vite + TypeScript            │
                   │      Tailwind CSS + Leaflet / MapLibre       │
                   └──────────────────────┬───────────────────────┘
                                          │ HTTP REST / JSON
                                          ▼
                   ┌──────────────────────────────────────────────┐
                   │           FastAPI Python Backend             │
                   │     (app.main, routes.api, stac_service)    │
                   └───────┬──────────────────────────────┬───────┘
                           │                              │
         COG Windowed Read │                              │ STAC API Query
                           ▼                              ▼
    ┌──────────────────────────────┐          ┌───────────────────────────┐
    │   Planetary Computer / AWS   │          │  Planetary Computer STAC  │
    │   Sentinel-2 L2A COGs        │          │  Catalog (sentinel-2-l2a) │
    │   (SCL & Visual bands)       │          └───────────────────────────┘
    └──────────────┬───────────────┘
                   │ AOI Window ndarray
                   ▼
    ┌──────────────────────────────┐
    │   Cloud Breaker Engine       │
    │  - SCL Class Metrics (0-11)  │
    │  - Pixel Trust Matrix (0-1)  │
    │  - Multi-Criteria Ranking    │
    │  - PNG Heatmap Encoders      │
    └──────────────────────────────┘
```

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Leaflet, Lucide Icons, Canvas Layer rendering.
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic, Rasterio, GDAL, NumPy, PySTAC Client, Planetary Computer SDK.
- **Data Source**: Sentinel-2 Level-2A (Bottom-of-Atmosphere surface reflectance) Cloud-Optimized GeoTIFFs (COGs).

---

## 🚀 Quick Start Guide

### Option 1: Run Locally (Recommended for Development)

#### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment
python -m venv venv
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend API will be running at: `http://127.0.0.1:8000`
Swagger interactive docs: `http://127.0.0.1:8000/docs`

#### 2. Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend will be running at: `http://localhost:5173`

---

### Option 2: Run with Docker Compose

Launch both backend and frontend in isolated containers with a single command:
```bash
docker compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

---

## 🧪 Running Unit Tests

Cloud Breaker includes automated tests covering SCL metric aggregation, per-pixel trust calculations, use-case penalty weighting, explainable ranking, and method incompatibility guards:

```bash
cd backend
python -m pytest tests/test_cloudbreaker_engine.py -v
```

Expected output:
```
tests/test_cloudbreaker_engine.py::test_scl_metrics_clear_vegetation PASSED
tests/test_cloudbreaker_engine.py::test_scl_metrics_mixed_cloud_shadow PASSED
tests/test_cloudbreaker_engine.py::test_pixel_trust_matrix_bounds PASSED
tests/test_cloudbreaker_engine.py::test_use_case_penalties PASSED
tests/test_cloudbreaker_engine.py::test_scene_ranking_explanation PASSED
tests/test_cloudbreaker_engine.py::test_s2cloudless_incompatibility_guard PASSED
tests/test_cloudbreaker_engine.py::test_processing_baseline_offset_rule PASSED
================ 7 passed in 1.77s =================
```

---

## 📡 API Contract Reference

### `POST /api/search`
Queries STAC for Sentinel-2 L2A candidate scenes intersecting the AOI.
- **Request Body**:
  ```json
  {
    "bbox": [-93.65, 41.98, -93.55, 42.06],
    "start_date": "2024-06-01",
    "end_date": "2024-06-30",
    "target_date": "2024-06-15",
    "max_scenes": 6
  }
  ```
- **Response**: List of candidate STAC scenes with thumbnail URLs, tile cloud cover %, processing baseline, and metadata.

### `POST /api/analyze`
Dispatches windowed COG analysis for the selected scene and AOI.
- **Request Body**:
  ```json
  {
    "scene_id": "S2A_MSIL2A_20240615T163841_N0510_R126_T15TVH",
    "bbox": [-93.65, 41.98, -93.55, 42.06],
    "use_case": "crop_monitoring",
    "target_date": "2024-06-15",
    "requested_method": "cloudbreaker_scl_fusion"
  }
  ```
- **Response**: `{ "job_id": "cb-4db71f26", "status": "running", "poll_url": "/api/jobs/cb-4db71f26" }`

### `GET /api/results/{id}`
Returns the complete Cloud Breaker analysis result:
- Usable % inside AOI vs Tile Cloud %
- SCL categorical distribution (classes 0–11)
- Explainable use-case ranking score & summary
- Base64 data URLs for SCL mask and Trust heatmap raster overlays
- Honest reliability status (`"reliable"` vs `"unreliable"`)
- Data source badge (`REAL` or `DEMO`)

### `GET /api/export/{id}`
Exports a self-contained, reproducible scientific audit report including:
- Processing baseline & reflectance offset (`-1000` DN rule)
- Bounding box coordinates & UTM CRS
- Algorithm parameters and fusion weights
- ISO 8601 timestamps

---

## ⏱️ 2-Minute Hackathon Demo Flow

1. **Open the Dashboard (`http://localhost:5173`)**:
   - Point out the clean UI, the live backend status indicator, the persistent disclaimer (*"decision support, not an official warning system"*), and the `REAL`/`DEMO` source badges.
2. **Navigate to "New Analysis"**:
   - In the interactive Leaflet map picker, click the **"Iowa Corn Belt"** preset (Crop Monitoring use-case).
   - Point out how the bounding box covers the exact field area rather than the entire 100km tile.
3. **Execute STAC Search**:
   - Click **"Search Sentinel-2 Scenes"**. Observe the candidate scenes returned from Microsoft Planetary Computer STAC catalog.
4. **Run Windowed AOI Analysis**:
   - Click **"Run AOI Window Analysis"** on the top scene.
   - Mention that Cloud Breaker executes a windowed HTTP range request on the Sentinel-2 L2A COGs, reading only the pixels in the AOI.
5. **Inspect the Dual Reality**:
   - On the results page, highlight the contrast: **100km Tile Cloud Cover: 42%**, but **AOI Usable Percentage: 91.2%**!
   - Explain how conventional pipelines would discard this scene, but Cloud Breaker proves the field itself is clean.
6. **Interact with the Map Viewer**:
   - Toggle between the **Per-Pixel Trust Heatmap** (0.0 to 1.0) and the **SCL Categorical Mask**.
   - Drag the **Before / After Split-Screen Slider** to inspect cloud boundaries over natural color RGB imagery.
7. **Demonstrate the Honest Empty State**:
   - Return to New Analysis and pick the **"Mumbai Monsoon Basin"** preset (extreme cloud cover).
   - Run analysis: Cloud Breaker detects unusable data (<25% clear) and displays an **Honest Alert: "Scene Unusable for Target Application"** with actionable guidance to switch to Sentinel-1 SAR or alternative dates.
8. **Export Reproducible Report**:
   - Click **"Export JSON Report"** to review the cryptographic/scientific audit payload containing S2 baseline metadata and reflectance offsets.

---

## 🔒 Technical & Honesty Principles

1. **No Invented Numbers**: Every metric in the UI originates from either real Sentinel-2 COG raster reads or the explicitly tagged `DEMO` bundle.
2. **Offset Transparency**: Sentinel-2 processing baselines $\ge$ 04.00 introduce a $-1000$ DN offset to avoid negative surface reflectance values. Cloud Breaker accounts for this in its pipeline.
3. **Method Incompatibility Protection**: Applying L1C top-of-atmosphere models (such as `s2cloudless`) to L2A surface reflectance is scientifically invalid. Cloud Breaker explicitly blocks this configuration.

---

## 👥 Credits
Built with ❤️ for the **Orbiton Hackathon — Open Innovation Track**.

# ClarityX — AI Satellite Imagery Cloud-Masking & Quality Intelligence Platform

ClarityX is a production-quality frontend application built with **React 18**, **Vite**, **TypeScript**, and **Tailwind CSS**. It delivers real-time satellite imagery quality grading, neural cloud/shadow segmentation analysis, and downstream usability intelligence (NDVI, Building Footprint, Change Detection).

---

## 🚀 Key Highlights & Capabilities

- **Interactive Satellite Map Viewer (Leaflet / MapLibre compatible)**:
  - **Split-Screen Swipe Curtain**: Real-time slider comparing True Color RGB imagery against AI Cloud-Mask Segmentation layers.
  - **Opacity Blending**: Continuous alpha slider (0% to 100%) for overlay inspection.
  - **Class Segment Legend**: Color-coded highlights for Clear Ground (`#10b981`), Thick Cloud (`#38bdf8`), Thin Cirrus Veil (`#f59e0b`), and Cloud Shadow (`#a855f7`).
  - **Geospatial Telemetry HUD**: Live cursor latitude/longitude coordinate tracker, CRS (`EPSG:32610`), spatial resolution (`10m/px`), and AOI bounding box polygons.
- **Master ClarityScore™ Ring (0–100)**:
  - SVG radial gauge with animated progress ring and ISO quality tier classification (*Pristine*, *Analysis Ready*, *Moderate Obstruction*, *Heavy Cloud Veil*).
- **Comprehensive Quality Intelligence**:
  - **Usable Land Surface Area (%)**
  - **Cirrus Attenuation Factor** (Water Vapour B9 band absorption index)
  - **Shadow Impact Score (%)** (Computed from solar azimuth and cloud elevation vectors)
  - **Downstream Usability Radar & Bar Charts** (NDVI Agronomy, Building Segmentation, Temporal Change Detection)
  - **Multispectral Per-Band SNR & Degradation Spectrum** (Interactive Recharts Bar/Area visualization across B1–B12 channels)
  - **Class Area Distribution Donut Chart**
- **S3 Direct Presigned Upload Pipeline**:
  - Drag-and-drop GeoTIFF / COG file upload with real-time progress bar.
  - S3 direct upload workflow via `GET /uploads/presign` and direct binary PUT.
  - Preset Benchmark Scenes (San Francisco, Amazon Rainforest, Tokyo Port, Dubai Waterfront) for instant 1-click evaluation.
- **Autonomous Live Polling Engine**:
  - TanStack Query auto-polls `pending` and `running` jobs until completion.
  - Simulates step-by-step progress (*Tile Ingestion -> Radiometric Normalization -> U-Net Transformer -> Quality Indexing*).
- **Built-in Mock Simulation Engine**:
  - When the FastAPI backend is offline or `VITE_API_URL` is omitted, ClarityX operates seamlessly with realistic satellite datasets, persistent localStorage state, and background queue progression.
  - 1-click toggle between **Live FastAPI Backend** and **Mock Simulation Mode** in the header.

---

## 🛠 Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 18** | UI framework with Concurrent React support |
| **Vite 5** | High-speed ESM bundler and dev server |
| **TypeScript** | Strict type safety across all API payloads and reports |
| **Tailwind CSS** | Aerospace-grade dark UI styling with responsive design |
| **React Router v6** | Client-side routing with protected layout |
| **TanStack Query (React Query)** | Data fetching, auto-polling, caching, and mutations |
| **Leaflet** | Interactive geospatial raster and polygon rendering |
| **Recharts** | Radar, Donut, and Multispectral Bar quality visualizations |
| **Axios** | HTTP client with Bearer auth interceptors |
| **Lucide React** | Space and geospatial iconography |

---

## 🛰 FastAPI Backend Integration

The app connects to the FastAPI backend via base URL specified in `VITE_API_URL`:

- `POST /auth/login` → Authenticates user and returns `{ access_token }`.
- `GET /uploads/presign?filename=...` → Returns `{ upload_url, s3_key }` for direct S3 upload.
- `POST /jobs` → Accepts `{ s3_key, sensor, engine: "fast" | "deep" }` and returns `{ job_id }`.
- `GET /jobs` → Returns list of all processing jobs.
- `GET /jobs/{id}` → Returns job execution status (`pending`, `running`, `done`, `failed`), `mask_url`, `rgb_preview_url`, `bounds`, and full `report`.
- `GET /health` → System diagnostic state (`status`, `gpu_available`, `active_workers`).

### Report Data Contract

```json
{
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
    { "band": "B1 (Coastal)", "snr": 34.2, "degradation": 14.8 },
    { "band": "B2 (Blue)", "snr": 41.5, "degradation": 12.3 },
    { "band": "B4 (Red)", "snr": 49.8, "degradation": 6.1 },
    { "band": "B8 (NIR)", "snr": 55.4, "degradation": 4.1 },
    { "band": "B9 (Cirrus)", "snr": 22.8, "degradation": 38.5 },
    { "band": "B11 (SWIR)", "snr": 48.3, "degradation": 7.2 }
  ]
}
```

---

## 🖥 Application Routes

1. `/login` — Work email + password authentication or API Key toggle with instant demo access.
2. `/` — Executive Quality Dashboard with KPI summary cards, average ClarityScore gauge, raster storage stats, and recent jobs table.
3. `/new` — GeoTIFF upload console with drag-and-drop zone, sensor constellation selector, AI engine selector (*Fast ONNX* vs *Deep Foundation Transformer*), and preset scenes.
4. `/jobs` — Jobs archive with search, sensor filter, engine filter, status filter, and minimum ClarityScore slider.
5. `/jobs/:id` — Full analysis view with the interactive map viewer (split/opacity slider), ClarityScore ring, downstream usability radar, per-band SNR chart, and JSON/PDF report export.

---

## 🏃 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
npm run preview
```

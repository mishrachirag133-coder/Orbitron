# ClarityX Backend API

FastAPI backend providing satellite imagery cloud-masking endpoints, telemetry grading, authentication, and raster upload pipelines.

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Python 3.10+
- Virtual environment tool (`venv`)

### 2. Setup Virtual Environment
```bash
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Interactive Swagger API docs will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📦 Deployment

### Deploy with Docker
```bash
docker build -t clarityx-backend .
docker run -p 8000:8000 clarityx-backend
```

### Deploy to Render / Railway / Fly.io
- Set root directory to `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

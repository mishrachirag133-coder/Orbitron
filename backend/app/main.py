from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models import HealthResponse
from app.routes import auth, uploads, jobs, api

app = FastAPI(
    title="Cloud Breaker — Satellite Quality Intelligence API",
    description="Quality-first layer on Sentinel-2 L2A STAC imagery. Evaluates AOI-window usable pixel share, SCL classifications, and per-pixel trust scores.",
    version="1.0.0"
)

# Enable CORS for local development and production deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(api.router)
app.include_router(auth.router)
app.include_router(uploads.router)
app.include_router(jobs.router)

@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        engines={
            "stac_scl_window": "active",
            "trust_fusion": "active"
        }
    )

@app.get("/", tags=["Root"])
def root():
    return {
        "service": "Cloud Breaker API",
        "status": "online",
        "documentation": "/docs",
        "disclaimer": "decision support, not an official warning system"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models import HealthResponse
from app.routes import auth, uploads, jobs

app = FastAPI(
    title="ClarityX Satellite Intelligence API",
    description="High-performance backend API for satellite cloud masking, radiometric quality analysis, and tile ingestion.",
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
app.include_router(auth.router)
app.include_router(uploads.router)
app.include_router(jobs.router)

@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        engines={
            "fast": "active",
            "deep": "active"
        }
    )

@app.get("/", tags=["Root"])
def root():
    return {
        "service": "ClarityX API",
        "status": "online",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

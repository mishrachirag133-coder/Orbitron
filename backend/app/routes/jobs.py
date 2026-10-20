from typing import List
from fastapi import APIRouter, HTTPException
from app.models import Job, CreateJobPayload, CreateJobResponse
from app.data import db

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("", response_model=List[Job])
def get_jobs():
    return db.list_jobs()

@router.post("", response_model=CreateJobResponse)
def create_job(payload: CreateJobPayload):
    new_job = db.add_job(payload.dict())
    return CreateJobResponse(job_id=new_job["job_id"])

@router.get("/{job_id}", response_model=Job)
def get_job_by_id(job_id: str):
    job = db.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

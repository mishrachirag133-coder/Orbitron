import os
from fastapi import APIRouter, Query, Request, Response
from app.models import PresignResponse

router = APIRouter(prefix="/uploads", tags=["Uploads"])

@router.get("/presign", response_model=PresignResponse)
def get_presign_url(request: Request, filename: str = Query(..., description="Uploaded raster filename")):
    # Base URL of the current running backend
    base_url = str(request.base_url).rstrip("/")
    clean_name = os.path.basename(filename)
    upload_url = f"{base_url}/uploads/file/{clean_name}"
    s3_key = f"uploads/{clean_name}"
    return PresignResponse(
        upload_url=upload_url,
        s3_key=s3_key
    )

@router.put("/file/{filename}")
async def upload_file_binary(filename: str, request: Request):
    # Receive the binary bytes from client PUT request
    _ = await request.body()
    return {"status": "success", "filename": filename, "message": "File received successfully"}

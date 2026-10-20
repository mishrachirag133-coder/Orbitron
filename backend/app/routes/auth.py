from fastapi import APIRouter, HTTPException
from app.models import LoginPayload, AuthResponse, UserInfo

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=AuthResponse)
def login(payload: LoginPayload):
    # Support both password and API key login
    if payload.apiKey:
        return AuthResponse(
            access_token=f"cx_token_{payload.apiKey[:12]}",
            user=UserInfo(
                email="service-account@clarityx.ai",
                organization="Satellite Analytics Mission",
                role="Service Account"
            )
        )
    
    email = payload.email or "operator@clarityx.ai"
    return AuthResponse(
        access_token=f"cx_token_{abs(hash(email)) % 100000000}",
        user=UserInfo(
            email=email,
            organization="ClarityX Earth Observation",
            role="Analyst"
        )
    )

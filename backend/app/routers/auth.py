from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Admin
from app.schemas import AdminCreate, AdminLogin, AdminResponse, TokenResponse
from app.auth import hash_password, verify_password, create_access_token, check_password_breached, get_current_admin
from app.config import settings
from app.limiter import limiter

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.RATE_LIMIT_AUTH)
def register(request: Request, payload: AdminCreate, db: Session = Depends(get_db)):
    existing = db.query(Admin).filter(
        (Admin.username == payload.username) | (Admin.email == payload.email)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered",
        )

    breach_count = check_password_breached(payload.password)
    if breach_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"This password has appeared in {breach_count} known data breaches "
                "and cannot be used. Please choose a different password."
            ),
        )

    admin = Admin(
        username=payload.username,
        email=payload.email,
        password=hash_password(payload.password),
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)

    token = create_access_token(data={"sub": str(admin.id)})
    return TokenResponse(
        access_token=token,
        admin=AdminResponse.model_validate(admin),
    )


@router.post("/login", response_model=TokenResponse)
@limiter.limit(settings.RATE_LIMIT_AUTH)
def login(request: Request, payload: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == payload.username).first()
    if not admin or not verify_password(payload.password, admin.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token = create_access_token(data={"sub": str(admin.id)})
    return TokenResponse(
        access_token=token,
        admin=AdminResponse.model_validate(admin),
    )


@router.get("/me", response_model=AdminResponse)
def get_me(current_admin: Admin = Depends(get_current_admin)):
    return AdminResponse.model_validate(current_admin)

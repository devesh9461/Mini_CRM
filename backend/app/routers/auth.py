from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Admin
from app.schemas import Token, AdminCreate, AdminResponse
from app.auth import verify_password, hash_password, create_access_token
from pydantic import BaseModel

from app.config import settings
from app.utils.disposable import is_disposable_email

router = APIRouter(prefix="/api/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate admin and return JWT access token."""
    admin = (
        db.query(Admin)
        .filter(
            (Admin.username == payload.username) | (Admin.email == payload.username)
        )
        .first()
    )
    if not admin or not verify_password(payload.password, admin.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    access_token = create_access_token(data={"sub": admin.username})
    return Token(
        access_token=access_token,
        token_type="bearer",
        admin=AdminResponse.model_validate(admin),
    )


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: AdminCreate, db: Session = Depends(get_db)):
    """Create a new administrator account and return JWT access token with validations."""
    # 1. Enforce Corporate Allowed Email Domains
    if settings.ALLOWED_REGISTRATION_DOMAINS:
        allowed_domains = [d.strip().lower() for d in settings.ALLOWED_REGISTRATION_DOMAINS.split(",") if d.strip()]
        email_domain = payload.email.split("@")[-1].lower()
        if email_domain not in allowed_domains:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Registration restricted to official corporate domains: {', '.join(allowed_domains)}",
            )

    # 2. Block Disposable Email Addresses
    if settings.BLOCK_DISPOSABLE_EMAILS:
        if is_disposable_email(payload.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Disposable or temporary email accounts are not permitted.",
            )

    # 3. Enforce Password Strength Guidelines
    if settings.ENFORCE_STRONG_PASSWORDS:
        pwd = payload.password
        if len(pwd) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long.",
            )
        if not any(char.isdigit() for char in pwd):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one numeric digit.",
            )
        if not any(char.isupper() for char in pwd):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one uppercase letter.",
            )
        if not any(char.islower() for char in pwd):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one lowercase letter.",
            )

    # Check if username or email already exists
    if db.query(Admin).filter(Admin.username == payload.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    if db.query(Admin).filter(Admin.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    new_admin = Admin(
        username=payload.username,
        email=payload.email,
        password=hash_password(payload.password),
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    access_token = create_access_token(data={"sub": new_admin.username})
    return Token(
        access_token=access_token,
        token_type="bearer",
        admin=AdminResponse.model_validate(new_admin),
    )

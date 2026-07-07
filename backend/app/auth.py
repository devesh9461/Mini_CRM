import hashlib
import requests
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Admin

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def check_password_breached(password: str) -> int:
    """Check if password has appeared in known data breaches via HIBP k-anonymity API.
    Returns the breach count (0 if never seen)."""
    sha1 = hashlib.sha1(password.encode()).hexdigest().upper()
    prefix, suffix = sha1[:5], sha1[5:]
    try:
        resp = requests.get(
            f"https://api.pwnedpasswords.com/range/{prefix}",
            timeout=5,
            headers={"User-Agent": "MiniCRM/1.0"},
        )
        if resp.status_code == 200:
            for line in resp.text.splitlines():
                line_suffix, count = line.split(":")
                if line_suffix == suffix:
                    return int(count)
    except requests.RequestException:
        pass
    return 0


def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Admin:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        raw_admin_id = payload.get("sub")
        if raw_admin_id is None:
            raise credentials_exception
        admin_id: str = str(raw_admin_id)
    except JWTError:
        raise credentials_exception

    try:
        admin_id_int = int(admin_id)
    except ValueError:
        raise credentials_exception
    admin = db.query(Admin).filter(Admin.id == admin_id_int).first()
    if admin is None:
        raise credentials_exception
    return admin

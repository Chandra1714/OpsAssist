import os
import uuid
from datetime import datetime, timedelta
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from . import database, models

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretopsassistkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
revoked_tokens: set[str] = set()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Bcrypt has a 72-byte limit; truncate for safety
    truncated = plain_password[:72]
    return pwd_context.verify(truncated, hashed_password)


def get_password_hash(password: str) -> str:
    # Bcrypt has a 72-byte limit; truncate to prevent errors
    truncated = password[:72]
    return pwd_context.hash(truncated)


def get_user(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def authenticate_user(db: Session, email: str, password: str):
    user = get_user(db, email)
    # Bcrypt limit: truncate password to 72 bytes
    truncated = password[:72]
    if not user or not pwd_context.verify(truncated, user.hashed_password):
        return None
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    to_encode.update({"jti": str(uuid.uuid4())})
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def logout_token(token: str) -> None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_exp": False})
        jti = payload.get("jti")
        if jti:
            revoked_tokens.add(jti)
    except JWTError:
        pass


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(database.SessionLocal)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        jti: str | None = payload.get("jti")
        if not email or not jti or jti in revoked_tokens:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(db, email=email)
    if user is None:
        raise credentials_exception
    return user


def require_role(current_user: models.User, allowed_roles: list[str]):
    if current_user.role not in allowed_roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges")
    return current_user

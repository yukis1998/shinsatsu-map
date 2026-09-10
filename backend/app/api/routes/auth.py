from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import LoginRequest, Token, UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> User:
    """ユーザー登録。メール重複は 409。"""
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="このメールアドレスは既に登録されています",
        )

    user = User(
        email=payload.email,
        display_name=payload.display_name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> Token:
    """ログイン。成功で JWT を発行。失敗は 401（理由は伏せる）。"""
    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="メールアドレスまたはパスワードが違います",
        )
    token = create_access_token(str(user.id))
    return Token(access_token=token, user=UserRead.model_validate(user))


@router.post("/logout")
def logout(current: User = Depends(get_current_user)) -> dict[str, str]:
    """ログアウト。JWT はステートレスのためクライアントがトークンを破棄する。"""
    return {"status": "ok"}


@router.get("/me", response_model=UserRead)
def me(current: User = Depends(get_current_user)) -> User:
    """現在ログイン中のユーザーを返す。"""
    return current

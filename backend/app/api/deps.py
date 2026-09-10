from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Authorization: Bearer <token> から現在のユーザーを解決する。"""
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "認証が必要です")
    subject = decode_access_token(credentials.credentials)
    if subject is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "トークンが無効です")
    user = db.get(User, int(subject))
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "ユーザーが見つかりません")
    return user

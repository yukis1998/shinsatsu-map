from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.spot import Spot
from app.models.user import User
from app.schemas.spot import SpotCreate, SpotRead

router = APIRouter(prefix="/spots", tags=["spots"])


@router.post("", response_model=SpotRead, status_code=status.HTTP_201_CREATED)
def create_spot(
    payload: SpotCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> Spot:
    """スポット投稿（ログイン必須）。投稿者は現在のユーザー。"""
    spot = Spot(**payload.model_dump(), user_id=current.id)
    db.add(spot)
    db.commit()
    db.refresh(spot)
    return spot

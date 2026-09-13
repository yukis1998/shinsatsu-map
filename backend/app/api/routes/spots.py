from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.bill_type import BillType
from app.models.spot import Spot
from app.models.user import User
from app.schemas.spot import SpotCreate, SpotRead

router = APIRouter(prefix="/spots", tags=["spots"])


@router.get("", response_model=list[SpotRead])
def list_spots(db: Session = Depends(get_db)) -> list[Spot]:
    """スポット一覧（認証不要）。新しい順。"""
    return list(db.scalars(select(Spot).order_by(Spot.created_at.desc())))


@router.get("/{spot_id}", response_model=SpotRead)
def get_spot(spot_id: int, db: Session = Depends(get_db)) -> Spot:
    """スポット詳細（認証不要）。存在しなければ404。"""
    spot = db.get(Spot, spot_id)
    if spot is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="スポットが見つかりません"
        )
    return spot


@router.post("", response_model=SpotRead, status_code=status.HTTP_201_CREATED)
def create_spot(
    payload: SpotCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> Spot:
    """スポット投稿（ログイン必須）。投稿者は現在のユーザー。"""
    data = payload.model_dump(exclude={"bill_type_ids"})
    spot = Spot(**data, user_id=current.id)
    if payload.bill_type_ids:
        spot.bill_types = list(
            db.scalars(select(BillType).where(BillType.id.in_(payload.bill_type_ids)))
        )
    db.add(spot)
    db.commit()
    db.refresh(spot)
    return spot

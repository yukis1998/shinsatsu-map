from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.spot import Spot
from app.models.user import User
from app.schemas.spot import SpotCreate, SpotRead
from app.services import spot_service

router = APIRouter(prefix="/spots", tags=["spots"])


def _get_or_404(db: Session, spot_id: int) -> Spot:
    spot = spot_service.get_spot(db, spot_id)
    if spot is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="スポットが見つかりません"
        )
    return spot


def _get_owned_or_error(db: Session, spot_id: int, current: User, action: str) -> Spot:
    spot = _get_or_404(db, spot_id)
    if spot.user_id != current.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail=f"{action}する権限がありません"
        )
    return spot


@router.get("", response_model=list[SpotRead])
def list_spots(
    q: str | None = None,
    bill_type_id: int | None = None,
    db: Session = Depends(get_db),
) -> list[Spot]:
    """スポット一覧（認証不要）。q=店名/住所の部分一致、bill_type_id=対応紙幣で絞り込み。"""
    return spot_service.list_spots(db, q=q, bill_type_id=bill_type_id)


@router.get("/{spot_id}", response_model=SpotRead)
def get_spot(spot_id: int, db: Session = Depends(get_db)) -> Spot:
    """スポット詳細（認証不要）。存在しなければ404。"""
    return _get_or_404(db, spot_id)


@router.post("", response_model=SpotRead, status_code=status.HTTP_201_CREATED)
def create_spot(
    payload: SpotCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> Spot:
    """スポット投稿（ログイン必須）。投稿者は現在のユーザー。"""
    return spot_service.create_spot(db, current.id, payload)


@router.put("/{spot_id}", response_model=SpotRead)
def update_spot(
    spot_id: int,
    payload: SpotCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> Spot:
    """スポット編集（自分の投稿のみ）。他人は403、無ければ404。"""
    spot = _get_owned_or_error(db, spot_id, current, "編集")
    return spot_service.update_spot(db, spot, payload)


@router.delete("/{spot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_spot(
    spot_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> None:
    """スポット削除（自分の投稿のみ）。他人は403、無ければ404。"""
    spot = _get_owned_or_error(db, spot_id, current, "削除")
    spot_service.delete_spot(db, spot)

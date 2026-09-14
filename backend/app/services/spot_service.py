"""スポットのデータ操作（サービス層）。

ルーターは HTTP の責務（認証・404/403 の変換）だけを持ち、
DB クエリ・更新のロジックはここに集約する。
"""

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.bill_type import BillType
from app.models.spot import Spot
from app.schemas.spot import SpotCreate


def list_spots(db: Session, q: str | None = None, bill_type_id: int | None = None) -> list[Spot]:
    stmt = select(Spot).order_by(Spot.created_at.desc(), Spot.id.desc())
    if q:
        like = f"%{q}%"
        stmt = stmt.where(or_(Spot.name.ilike(like), Spot.address.ilike(like)))
    if bill_type_id is not None:
        stmt = stmt.where(Spot.bill_types.any(BillType.id == bill_type_id))
    return list(db.scalars(stmt))


def get_spot(db: Session, spot_id: int) -> Spot | None:
    return db.get(Spot, spot_id)


def _resolve_bill_types(db: Session, bill_type_ids: list[int]) -> list[BillType]:
    if not bill_type_ids:
        return []
    return list(db.scalars(select(BillType).where(BillType.id.in_(bill_type_ids))))


def create_spot(db: Session, user_id: int, payload: SpotCreate) -> Spot:
    data = payload.model_dump(exclude={"bill_type_ids"})
    spot = Spot(**data, user_id=user_id)
    spot.bill_types = _resolve_bill_types(db, payload.bill_type_ids)
    db.add(spot)
    db.commit()
    db.refresh(spot)
    return spot


def update_spot(db: Session, spot: Spot, payload: SpotCreate) -> Spot:
    data = payload.model_dump(exclude={"bill_type_ids"})
    for key, value in data.items():
        setattr(spot, key, value)
    spot.bill_types = _resolve_bill_types(db, payload.bill_type_ids)
    db.commit()
    db.refresh(spot)
    return spot


def delete_spot(db: Session, spot: Spot) -> None:
    db.delete(spot)
    db.commit()

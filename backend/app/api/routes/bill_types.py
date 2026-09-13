from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.bill_type import BillType
from app.schemas.bill_type import BillTypeRead

router = APIRouter(prefix="/bill-types", tags=["bill-types"])


@router.get("", response_model=list[BillTypeRead])
def list_bill_types(db: Session = Depends(get_db)) -> list[BillType]:
    """対応紙幣マスタ一覧（認証不要）。"""
    return list(db.scalars(select(BillType).order_by(BillType.sort_order)))

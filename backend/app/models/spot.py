from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, Float, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.associations import spot_bill_types

if TYPE_CHECKING:
    from app.models.bill_type import BillType


class Spot(Base):
    __tablename__ = "spots"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    # 最終確認日（情報の鮮度）
    last_confirmed_on: Mapped[date | None] = mapped_column(Date, nullable=True)
    # 地図表示(#16)用。MVP投稿フォームでは任意。
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # 対応紙幣（多対多）。一覧のN+1を避けるため selectin で一括ロード。
    bill_types: Mapped[list["BillType"]] = relationship(
        secondary=spot_bill_types,
        lazy="selectin",
        order_by="BillType.sort_order",
    )

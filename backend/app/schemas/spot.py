from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.bill_type import BillTypeRead


class SpotCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    address: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    last_confirmed_on: date | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    bill_type_ids: list[int] = Field(default_factory=list)

    @field_validator("last_confirmed_on")
    @classmethod
    def _reject_future_date(cls, v: date | None) -> date | None:
        """最終確認日に未来日は許可しない（「確認済み」という意味に矛盾するため）。"""
        if v is not None and v > date.today():
            raise ValueError("最終確認日は今日以前の日付を指定してください")
        return v


class SpotRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    address: str
    description: str | None
    last_confirmed_on: date | None
    latitude: float | None
    longitude: float | None
    user_id: int
    created_at: datetime
    bill_types: list[BillTypeRead] = Field(default_factory=list)

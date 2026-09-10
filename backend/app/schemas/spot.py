from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class SpotCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    address: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    last_confirmed_on: date | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)


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

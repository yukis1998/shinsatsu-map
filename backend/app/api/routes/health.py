from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict[str, str]:
    """アプリの生存確認（DB 非依存）。"""
    return {"status": "ok"}


@router.get("/health/db")
def health_db(db: Session = Depends(get_db)) -> dict[str, str]:
    """DB 接続確認。SELECT 1 が通れば connected。"""
    db.execute(text("SELECT 1"))
    return {"status": "ok", "db": "connected"}

import pytest
from sqlalchemy.exc import IntegrityError

from app.core.security import hash_password
from app.models.user import User


def _make_user(display: str, email: str = "x@example.com") -> User:
    return User(
        email=email,
        display_name=display,
        hashed_password=hash_password("password123"),
    )


def test_user_email_must_be_unique(db):
    db.add(_make_user("A"))
    db.commit()
    db.add(_make_user("B"))
    with pytest.raises(IntegrityError):
        db.commit()


def test_user_stores_hashed_password_not_plain(db):
    user = _make_user("Y", email="y@example.com")
    db.add(user)
    db.commit()
    db.refresh(user)
    assert user.hashed_password != "password123"
    assert user.id is not None
    assert user.created_at is not None

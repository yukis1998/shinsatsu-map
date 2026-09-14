from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_hash_password_differs_and_verifies():
    hashed = hash_password("password123")
    assert hashed != "password123"
    assert verify_password("password123", hashed) is True
    assert verify_password("wrongpass", hashed) is False


def test_token_roundtrip():
    token = create_access_token("42")
    assert decode_access_token(token) == "42"


def test_token_invalid_returns_none():
    assert decode_access_token("garbage.token.xxx") is None
    token = create_access_token("42")
    assert decode_access_token(token[:-2] + "xx") is None

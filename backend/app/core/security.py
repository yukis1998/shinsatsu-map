import bcrypt


def hash_password(password: str) -> str:
    """平文パスワードを bcrypt でハッシュ化する。"""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    """平文パスワードがハッシュに一致するか検証する。"""
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))

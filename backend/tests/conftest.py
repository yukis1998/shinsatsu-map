import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401  # モデルを Base に登録
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.bill_type import BillType

# テスト用 DB は in-memory SQLite（Docker/Postgres 不要）。
# StaticPool + 単一コネクションで全リクエストから同じ DB を参照する。
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

BILL_TYPES = ["千円札", "五千円札", "一万円札"]


def _override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = _override_get_db


@pytest.fixture(autouse=True)
def _setup_db():
    """各テストごとにテーブルを作り直し、対応紙幣マスタを投入する。"""
    Base.metadata.create_all(bind=engine)
    with TestingSessionLocal() as session:
        session.add_all([BillType(name=n, sort_order=i + 1) for i, n in enumerate(BILL_TYPES)])
        session.commit()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


def _register_and_login(client: TestClient, email: str, display_name: str) -> dict:
    client.post(
        "/auth/register",
        json={"email": email, "display_name": display_name, "password": "password123"},
    )
    res = client.post("/auth/login", json={"email": email, "password": "password123"})
    return res.json()


@pytest.fixture
def auth(client: TestClient) -> dict:
    data = _register_and_login(client, "user1@example.com", "ユーザー1")
    return {"headers": {"Authorization": f"Bearer {data['access_token']}"}, "user": data["user"]}


@pytest.fixture
def auth2(client: TestClient) -> dict:
    data = _register_and_login(client, "user2@example.com", "ユーザー2")
    return {"headers": {"Authorization": f"Bearer {data['access_token']}"}, "user": data["user"]}


@pytest.fixture
def bill_type_ids(client: TestClient) -> list[int]:
    return [b["id"] for b in client.get("/bill-types").json()]

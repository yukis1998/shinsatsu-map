def test_register_success(client):
    res = client.post(
        "/auth/register",
        json={"email": "a@example.com", "display_name": "太郎", "password": "password123"},
    )
    assert res.status_code == 201
    body = res.json()
    assert body["email"] == "a@example.com"
    assert body["display_name"] == "太郎"
    assert "hashed_password" not in body
    assert "password" not in body


def test_register_duplicate_email(client):
    payload = {"email": "dup@example.com", "display_name": "太郎", "password": "password123"}
    client.post("/auth/register", json=payload)
    res = client.post("/auth/register", json={**payload, "display_name": "次郎"})
    assert res.status_code == 409
    # メールの存在を第三者に知らせない濁した文言にする（アカウント列挙対策）
    assert res.json()["detail"] == "このメールアドレスは使用できません"


def test_register_invalid_email(client):
    res = client.post(
        "/auth/register",
        json={"email": "not-an-email", "display_name": "太郎", "password": "password123"},
    )
    assert res.status_code == 422


def test_register_short_password(client):
    res = client.post(
        "/auth/register",
        json={"email": "b@example.com", "display_name": "太郎", "password": "short"},
    )
    assert res.status_code == 422


def test_login_success(client):
    client.post(
        "/auth/register",
        json={"email": "c@example.com", "display_name": "太郎", "password": "password123"},
    )
    res = client.post("/auth/login", json={"email": "c@example.com", "password": "password123"})
    assert res.status_code == 200
    body = res.json()
    assert body["access_token"]
    assert body["token_type"] == "bearer"
    assert body["user"]["email"] == "c@example.com"


def test_login_wrong_password(client):
    client.post(
        "/auth/register",
        json={"email": "d@example.com", "display_name": "太郎", "password": "password123"},
    )
    res = client.post("/auth/login", json={"email": "d@example.com", "password": "wrongpass1"})
    assert res.status_code == 401


def test_login_nonexistent(client):
    res = client.post(
        "/auth/login",
        json={"email": "nobody@example.com", "password": "password123"},
    )
    assert res.status_code == 401


def test_me_with_token(client, auth):
    res = client.get("/auth/me", headers=auth["headers"])
    assert res.status_code == 200
    assert res.json()["email"] == "user1@example.com"


def test_me_without_token(client):
    assert client.get("/auth/me").status_code == 401


def test_me_invalid_token(client):
    res = client.get("/auth/me", headers={"Authorization": "Bearer garbage.token.xxx"})
    assert res.status_code == 401


def test_logout_with_token(client, auth):
    assert client.post("/auth/logout", headers=auth["headers"]).status_code == 200


def test_logout_without_token(client):
    assert client.post("/auth/logout").status_code == 401

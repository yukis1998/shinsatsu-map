from datetime import date, timedelta


def _payload(**kw):
    base = {"name": "テスト銀行", "address": "東京都千代田区1-1"}
    base.update(kw)
    return base


# --- create ---
def test_create_requires_auth(client):
    assert client.post("/spots", json=_payload()).status_code == 401


def test_create_success_with_bill_types(client, auth, bill_type_ids):
    res = client.post(
        "/spots",
        json=_payload(bill_type_ids=bill_type_ids[:2]),
        headers=auth["headers"],
    )
    assert res.status_code == 201
    body = res.json()
    assert body["name"] == "テスト銀行"
    assert body["user_id"] == auth["user"]["id"]
    assert len(body["bill_types"]) == 2


def test_create_validation_error(client, auth):
    res = client.post("/spots", json={"name": "", "address": "住所"}, headers=auth["headers"])
    assert res.status_code == 422


def test_create_rejects_future_last_confirmed_on(client, auth):
    future = (date.today() + timedelta(days=1)).isoformat()
    res = client.post(
        "/spots", json=_payload(last_confirmed_on=future), headers=auth["headers"]
    )
    assert res.status_code == 422


def test_create_allows_today_last_confirmed_on(client, auth):
    today = date.today().isoformat()
    res = client.post(
        "/spots", json=_payload(last_confirmed_on=today), headers=auth["headers"]
    )
    assert res.status_code == 201


def test_update_rejects_future_last_confirmed_on(client, auth):
    created = client.post("/spots", json=_payload(), headers=auth["headers"]).json()
    future = (date.today() + timedelta(days=1)).isoformat()
    res = client.put(
        f"/spots/{created['id']}",
        json=_payload(last_confirmed_on=future),
        headers=auth["headers"],
    )
    assert res.status_code == 422


# --- list ---
def test_list_newest_first(client, auth):
    client.post("/spots", json=_payload(name="古い"), headers=auth["headers"])
    client.post("/spots", json=_payload(name="新しい"), headers=auth["headers"])
    names = [s["name"] for s in client.get("/spots").json()]
    assert names[0] == "新しい"


def test_list_filter_by_keyword(client, auth):
    client.post("/spots", json=_payload(name="みずほ銀行", address="渋谷"), headers=auth["headers"])
    client.post("/spots", json=_payload(name="三菱銀行", address="新宿"), headers=auth["headers"])
    names = [s["name"] for s in client.get("/spots", params={"q": "みずほ"}).json()]
    assert names == ["みずほ銀行"]


def test_list_filter_by_bill_type(client, auth, bill_type_ids):
    client.post(
        "/spots",
        json=_payload(name="千円あり", bill_type_ids=[bill_type_ids[0]]),
        headers=auth["headers"],
    )
    client.post("/spots", json=_payload(name="紙幣なし"), headers=auth["headers"])
    res = client.get("/spots", params={"bill_type_id": bill_type_ids[0]})
    names = [s["name"] for s in res.json()]
    assert names == ["千円あり"]


# --- detail ---
def test_detail_and_not_found(client, auth):
    created = client.post("/spots", json=_payload(), headers=auth["headers"]).json()
    assert client.get(f"/spots/{created['id']}").status_code == 200
    assert client.get("/spots/999999").status_code == 404


# --- update ---
def test_update_own(client, auth, bill_type_ids):
    created = client.post("/spots", json=_payload(), headers=auth["headers"]).json()
    res = client.put(
        f"/spots/{created['id']}",
        json=_payload(name="更新後", bill_type_ids=[bill_type_ids[0]]),
        headers=auth["headers"],
    )
    assert res.status_code == 200
    assert res.json()["name"] == "更新後"
    assert len(res.json()["bill_types"]) == 1


def test_update_other_forbidden(client, auth, auth2):
    created = client.post("/spots", json=_payload(), headers=auth["headers"]).json()
    res = client.put(
        f"/spots/{created['id']}",
        json=_payload(name="乗っ取り"),
        headers=auth2["headers"],
    )
    assert res.status_code == 403


def test_update_missing_and_unauth(client, auth):
    created = client.post("/spots", json=_payload(), headers=auth["headers"]).json()
    assert client.put("/spots/999999", json=_payload(), headers=auth["headers"]).status_code == 404
    assert client.put(f"/spots/{created['id']}", json=_payload()).status_code == 401


# --- delete ---
def test_delete_own(client, auth):
    created = client.post("/spots", json=_payload(), headers=auth["headers"]).json()
    assert client.delete(f"/spots/{created['id']}", headers=auth["headers"]).status_code == 204
    assert client.get(f"/spots/{created['id']}").status_code == 404


def test_delete_other_forbidden(client, auth, auth2):
    created = client.post("/spots", json=_payload(), headers=auth["headers"]).json()
    assert client.delete(f"/spots/{created['id']}", headers=auth2["headers"]).status_code == 403


def test_delete_missing_and_unauth(client, auth):
    created = client.post("/spots", json=_payload(), headers=auth["headers"]).json()
    assert client.delete("/spots/999999", headers=auth["headers"]).status_code == 404
    assert client.delete(f"/spots/{created['id']}").status_code == 401


# --- N+1 ---
def test_list_avoids_n_plus_one(client, auth, bill_type_ids, query_counter):
    for i in range(5):
        client.post(
            "/spots",
            json=_payload(name=f"spot{i}", bill_type_ids=bill_type_ids),
            headers=auth["headers"],
        )
    with query_counter() as selects:
        res = client.get("/spots")
    assert res.status_code == 200
    assert len(res.json()) == 5
    # selectin により「スポット本体」＋「bill_types 一括取得」の少数クエリで済む。
    # N+1 なら 1 + 5 = 6 件以上になる。
    assert len(selects) <= 3, f"N+1 の疑い: SELECT が {len(selects)} 件"

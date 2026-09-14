def test_list_bill_types(client):
    res = client.get("/bill-types")
    assert res.status_code == 200
    names = [b["name"] for b in res.json()]
    assert names == ["千円札", "五千円札", "一万円札"]

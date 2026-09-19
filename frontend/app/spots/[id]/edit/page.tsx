"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { API_BASE } from "@/lib/api";
import { getToken, getUser } from "@/lib/auth";
import { todayStr } from "@/lib/date";

const MapPicker = dynamic(() => import("../../../components/MapPicker"), { ssr: false });

type BillType = { id: number; name: string };
type Load = "loading" | "ready" | "unauth" | "forbidden" | "notfound" | "error";
type Status = "idle" | "loading" | "error";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 16,
  border: "1px solid #d0d4d9",
  borderRadius: 8,
  marginTop: 4,
};

export default function EditSpotPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [load, setLoad] = useState<Load>("loading");
  const [billTypes, setBillTypes] = useState<BillType[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [lastConfirmedOn, setLastConfirmedOn] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    if (!getToken()) {
      setLoad("unauth");
      return;
    }
    (async () => {
      try {
        const [btRes, spRes] = await Promise.all([
          fetch(`${API_BASE}/bill-types`),
          fetch(`${API_BASE}/spots/${id}`),
        ]);
        if (spRes.status === 404) {
          setLoad("notfound");
          return;
        }
        if (!spRes.ok) throw new Error();
        const sp = await spRes.json();
        if (btRes.ok) setBillTypes((await btRes.json()) as BillType[]);
        const me = getUser();
        if (!me || me.id !== sp.user_id) {
          setLoad("forbidden");
          return;
        }
        setName(sp.name);
        setAddress(sp.address);
        setDescription(sp.description ?? "");
        setLastConfirmedOn(sp.last_confirmed_on ?? "");
        setLat(sp.latitude);
        setLng(sp.longitude);
        setSelected((sp.bill_types ?? []).map((b: BillType) => b.id));
        setLoad("ready");
      } catch {
        setLoad("error");
      }
    })();
  }, [id]);

  function toggle(bid: number) {
    setSelected((prev) => (prev.includes(bid) ? prev.filter((x) => x !== bid) : [...prev, bid]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      setLoad("unauth");
      return;
    }
    if (lastConfirmedOn && lastConfirmedOn > todayStr()) {
      setStatus("error");
      setMessage("最終確認日は今日以前の日付を指定してください。");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/spots/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name,
          address,
          description: description || null,
          last_confirmed_on: lastConfirmedOn || null,
          latitude: lat,
          longitude: lng,
          bill_type_ids: selected,
        }),
      });
      if (res.ok) {
        router.push(`/spots/${id}`);
        router.refresh();
        return;
      }
      if (res.status === 403) setMessage("編集する権限がありません。");
      else if (res.status === 401) setMessage("ログインの有効期限が切れています。再度ログインしてください。");
      else if (res.status === 422) setMessage("入力内容を確認してください（店舗名・住所は必須です）。");
      else setMessage(`更新に失敗しました（${res.status}）。`);
      setStatus("error");
    } catch {
      setStatus("error");
      setMessage("通信エラーが発生しました。時間をおいて再度お試しください。");
    }
  }

  if (load === "loading") return <main className="container"><p>読み込み中…</p></main>;
  if (load === "unauth")
    return (
      <main className="container" style={{ maxWidth: 480 }}>
        <p>編集にはログインが必要です。</p>
        <Link href="/login">ログイン</Link>
      </main>
    );
  if (load === "notfound") return <main className="container"><p>スポットが見つかりません。</p></main>;
  if (load === "forbidden")
    return (
      <main className="container" style={{ maxWidth: 480 }}>
        <p>この投稿を編集する権限がありません。</p>
        <Link href={`/spots/${id}`}>詳細へ戻る</Link>
      </main>
    );
  if (load === "error")
    return <main className="container"><p style={{ color: "#c5221f" }}>読み込みに失敗しました。</p></main>;

  return (
    <main className="container" style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>スポットを編集</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          border: "1px solid #e6e8eb",
          borderRadius: 12,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <label>
          店舗名 <span style={{ color: "#c5221f" }}>*</span>
          <input type="text" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        </label>
        <label>
          住所 <span style={{ color: "#c5221f" }}>*</span>
          <input type="text" required maxLength={255} value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyle} />
        </label>

        {billTypes.length > 0 && (
          <fieldset style={{ border: "1px solid #e6e8eb", borderRadius: 8, padding: 12 }}>
            <legend style={{ fontSize: 14, color: "#555" }}>対応紙幣（複数選択可）</legend>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {billTypes.map((b) => (
                <label key={b.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input type="checkbox" checked={selected.includes(b.id)} onChange={() => toggle(b.id)} />
                  {b.name}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div>
          <span style={{ fontSize: 14, color: "#555" }}>場所（地図をクリックして選択・任意）</span>
          <div style={{ marginTop: 4 }}>
            <MapPicker lat={lat} lng={lng} onPick={(la, ln) => { setLat(la); setLng(ln); }} />
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>
            {lat != null && lng != null ? `選択中: ${lat.toFixed(5)}, ${lng.toFixed(5)}` : "地図をクリックすると位置を登録できます"}
          </p>
        </div>

        <label>
          メモ（注意点など）
          <textarea rows={3} maxLength={2000} value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
        </label>
        <label>
          最終確認日
          <input type="date" max={todayStr()} value={lastConfirmedOn} onChange={(e) => setLastConfirmedOn(e.target.value)} style={inputStyle} />
        </label>

        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            background: status === "loading" ? "#9db8e8" : "#1f6feb",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 8,
            border: "none",
            fontWeight: 600,
            fontSize: 16,
            cursor: status === "loading" ? "default" : "pointer",
          }}
        >
          {status === "loading" ? "更新中…" : "更新する"}
        </button>

        {message && (
          <p role="status" style={{ margin: 0, color: "#c5221f", fontWeight: 600 }}>
            {message}
          </p>
        )}
      </form>

      <p style={{ marginTop: 16, color: "#555" }}>
        <Link href={`/spots/${id}`}>詳細へ戻る</Link>
      </p>
    </main>
  );
}

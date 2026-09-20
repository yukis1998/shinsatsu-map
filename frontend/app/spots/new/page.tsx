"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { API_BASE } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { todayStr } from "@/lib/date";

const MapPicker = dynamic(() => import("../../components/MapPicker"), { ssr: false });

type BillType = { id: number; name: string };
type Status = "idle" | "loading" | "success" | "error";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 16,
  border: "1px solid #d0d4d9",
  borderRadius: 8,
  marginTop: 4,
};

export default function NewSpotPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
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
    setAuthed(!!getToken());
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/bill-types`);
        if (res.ok) setBillTypes((await res.json()) as BillType[]);
      } catch {
        // マスタ取得失敗時はチェックボックスなしで投稿可能
      }
    })();
  }, []);

  function toggle(id: number) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      setAuthed(false);
      return;
    }
    if (lastConfirmedOn && lastConfirmedOn > todayStr()) {
      setStatus("error");
      setMessage("最終確認日は今日以前の日付を指定してください。");
      return;
    }
    if (selected.length === 0) {
      setStatus("error");
      setMessage("対応紙幣を1つ以上選択してください。");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/spots`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
      if (res.status === 201) {
        // 投稿成功。一覧画面へ遷移（最新が先頭に表示される）。
        router.push("/spots");
        router.refresh();
        return;
      } else if (res.status === 401) {
        setStatus("error");
        setMessage("ログインの有効期限が切れています。再度ログインしてください。");
      } else if (res.status === 422) {
        setStatus("error");
        setMessage("入力内容を確認してください（店舗名・住所は必須です）。");
      } else {
        setStatus("error");
        setMessage(`投稿に失敗しました（${res.status}）。`);
      }
    } catch {
      setStatus("error");
      setMessage("通信エラーが発生しました。時間をおいて再度お試しください。");
    }
  }

  if (authed === null) {
    return <main className="container" />;
  }

  if (!authed) {
    return (
      <main className="container" style={{ maxWidth: 480 }}>
        <h1 style={{ fontSize: 26 }}>スポットを投稿</h1>
        <p>投稿にはログインが必要です。</p>
        <p>
          <Link href="/login">ログイン</Link> ／ <Link href="/register">新規登録</Link>
        </p>
      </main>
    );
  }

  return (
    <main className="container" style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>スポットを投稿</h1>
      <p style={{ color: "#555", marginTop: 0 }}>
        新札が手に入る・両替できる場所を共有しましょう。
      </p>

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
          <input
            type="text"
            required
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          住所 <span style={{ color: "#c5221f" }}>*</span>
          <input
            type="text"
            required
            maxLength={255}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={inputStyle}
          />
        </label>

        {billTypes.length > 0 && (
          <fieldset style={{ border: "1px solid #e6e8eb", borderRadius: 8, padding: 12 }}>
            <legend style={{ fontSize: 14, color: "#555" }}>
              対応紙幣（1つ以上選択） <span style={{ color: "#c5221f" }}>*</span>
            </legend>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {billTypes.map((b) => (
                <label key={b.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input
                    type="checkbox"
                    checked={selected.includes(b.id)}
                    onChange={() => toggle(b.id)}
                  />
                  {b.name}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div>
          <span style={{ fontSize: 14, color: "#555" }}>
            場所（地図をクリックして選択・任意）
          </span>
          <div style={{ marginTop: 4 }}>
            <MapPicker
              lat={lat}
              lng={lng}
              onPick={(la, ln) => {
                setLat(la);
                setLng(ln);
              }}
            />
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>
            {lat != null && lng != null
              ? `選択中: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
              : "地図をクリックすると位置を登録できます"}
          </p>
        </div>

        <label>
          メモ（注意点など）
          <textarea
            rows={3}
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </label>
        <label>
          最終確認日
          <input
            type="date"
            max={todayStr()}
            value={lastConfirmedOn}
            onChange={(e) => setLastConfirmedOn(e.target.value)}
            style={inputStyle}
          />
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
          {status === "loading" ? "投稿中…" : "投稿する"}
        </button>

        {message && (
          <p
            role="status"
            style={{
              margin: 0,
              color: status === "success" ? "#137333" : "#c5221f",
              fontWeight: 600,
            }}
          >
            {message}
          </p>
        )}
      </form>

      <p style={{ marginTop: 16, color: "#555" }}>
        <Link href="/">トップへ</Link>
      </p>
    </main>
  );
}

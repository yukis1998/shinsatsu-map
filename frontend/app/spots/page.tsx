"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { API_BASE } from "@/lib/api";

type Spot = {
  id: number;
  name: string;
  address: string;
  description: string | null;
  last_confirmed_on: string | null;
  latitude: number | null;
  longitude: number | null;
  user_id: number;
  created_at: string;
  bill_types: { id: number; name: string }[];
};

type BillType = { id: number; name: string };
type State = "loading" | "loaded" | "error";

const controlStyle: React.CSSProperties = {
  padding: "8px 10px",
  fontSize: 15,
  border: "1px solid #d0d4d9",
  borderRadius: 8,
};

export default function SpotsPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [state, setState] = useState<State>("loading");
  const [billTypes, setBillTypes] = useState<BillType[]>([]);
  const [q, setQ] = useState("");
  const [billTypeId, setBillTypeId] = useState("");

  const fetchSpots = useCallback(async () => {
    setState("loading");
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (billTypeId) params.set("bill_type_id", billTypeId);
      const query = params.toString();
      const res = await fetch(`${API_BASE}/spots${query ? `?${query}` : ""}`);
      if (!res.ok) throw new Error();
      setSpots((await res.json()) as Spot[]);
      setState("loaded");
    } catch {
      setState("error");
    }
  }, [q, billTypeId]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/bill-types`);
        if (res.ok) setBillTypes((await res.json()) as BillType[]);
      } catch {
        // フィルタ用マスタ取得失敗は無視
      }
    })();
  }, []);

  useEffect(() => {
    fetchSpots();
    // 初回のみ全件ロード
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchSpots();
  }

  return (
    <main className="container">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h1 style={{ fontSize: 26, margin: 0 }}>スポット一覧</h1>
        <Link
          href="/spots/new"
          style={{
            background: "#1f6feb",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          投稿する
        </Link>
      </div>

      <form
        onSubmit={onSearch}
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}
      >
        <input
          type="text"
          placeholder="店名・住所で検索"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ ...controlStyle, flex: "1 1 180px" }}
        />
        <select
          value={billTypeId}
          onChange={(e) => setBillTypeId(e.target.value)}
          style={controlStyle}
        >
          <option value="">対応紙幣（すべて）</option>
          {billTypes.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          style={{
            ...controlStyle,
            background: "#1f6feb",
            color: "#fff",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          検索
        </button>
      </form>

      {state === "loading" && <p style={{ color: "#555" }}>読み込み中…</p>}

      {state === "error" && (
        <p style={{ color: "#c5221f" }}>
          読み込みに失敗しました。時間をおいて再度お試しください。
        </p>
      )}

      {state === "loaded" && spots.length === 0 && (
        <p style={{ color: "#555" }}>条件に一致するスポットがありません。</p>
      )}

      {state === "loaded" &&
        spots.map((s) => (
          <Link
            key={s.id}
            href={`/spots/${s.id}`}
            style={{ textDecoration: "none", color: "inherit", display: "block" }}
          >
            <article
              style={{
                background: "#fff",
                border: "1px solid #e6e8eb",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <h2 style={{ fontSize: 18, margin: "0 0 4px" }}>{s.name}</h2>
              <p style={{ margin: "0 0 4px", color: "#333" }}>{s.address}</p>
              {s.bill_types.length > 0 && (
                <p style={{ margin: "0 0 4px", color: "#1f6feb", fontSize: 13 }}>
                  対応紙幣: {s.bill_types.map((b) => b.name).join(" / ")}
                </p>
              )}
              {s.description && (
                <p style={{ margin: "0 0 4px", color: "#555", whiteSpace: "pre-wrap" }}>
                  {s.description}
                </p>
              )}
              <p style={{ margin: 0, color: "#888", fontSize: 13 }}>
                最終確認日: {s.last_confirmed_on ?? "未確認"}
              </p>
            </article>
          </Link>
        ))}
    </main>
  );
}

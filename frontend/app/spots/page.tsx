"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
};

type State = "loading" | "loaded" | "error";

export default function SpotsPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/spots`);
        if (!res.ok) throw new Error();
        setSpots((await res.json()) as Spot[]);
        setState("loaded");
      } catch {
        setState("error");
      }
    })();
  }, []);

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

      {state === "loading" && <p style={{ color: "#555" }}>読み込み中…</p>}

      {state === "error" && (
        <p style={{ color: "#c5221f" }}>
          読み込みに失敗しました。時間をおいて再度お試しください。
        </p>
      )}

      {state === "loaded" && spots.length === 0 && (
        <p style={{ color: "#555" }}>
          まだ投稿がありません。最初のスポットを
          <Link href="/spots/new">投稿</Link>してみましょう。
        </p>
      )}

      {state === "loaded" &&
        spots.map((s) => (
          <article
            key={s.id}
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
            {s.description && (
              <p style={{ margin: "0 0 4px", color: "#555", whiteSpace: "pre-wrap" }}>
                {s.description}
              </p>
            )}
            <p style={{ margin: 0, color: "#888", fontSize: 13 }}>
              最終確認日: {s.last_confirmed_on ?? "未確認"}
            </p>
          </article>
        ))}
    </main>
  );
}

"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { API_BASE } from "@/lib/api";
import { getToken, getUser } from "@/lib/auth";

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

type State = "loading" | "loaded" | "notfound" | "error";

const dtStyle: React.CSSProperties = {
  color: "#888",
  fontSize: 13,
  marginTop: 12,
};
const ddStyle: React.CSSProperties = {
  margin: "2px 0 0",
  color: "#222",
};

export default function SpotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const [spot, setSpot] = useState<Spot | null>(null);
  const [state, setState] = useState<State>("loading");
  const [meId, setMeId] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    setMeId(getUser()?.id ?? null);
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/spots/${id}`);
        if (res.status === 404) {
          setState("notfound");
          return;
        }
        if (!res.ok) throw new Error();
        setSpot((await res.json()) as Spot);
        setState("loaded");
      } catch {
        setState("error");
      }
    })();
  }, [id]);

  async function handleDelete() {
    if (!spot) return;
    if (!window.confirm("このスポットを削除しますか？この操作は取り消せません。")) return;
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/spots/${spot.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        router.push("/spots");
        router.refresh();
        return;
      }
      if (res.status === 403) alert("削除する権限がありません。");
      else if (res.status === 401) router.push("/login");
      else alert(`削除に失敗しました（${res.status}）。`);
    } catch {
      alert("通信エラーが発生しました。時間をおいて再度お試しください。");
    }
  }

  return (
    <main className="container" style={{ maxWidth: 640 }}>
      <p style={{ marginTop: 0 }}>
        <Link href="/spots">← 一覧へ戻る</Link>
      </p>

      {state === "loading" && <p style={{ color: "#555" }}>読み込み中…</p>}
      {state === "notfound" && <p style={{ color: "#555" }}>スポットが見つかりません。</p>}
      {state === "error" && (
        <p style={{ color: "#c5221f" }}>読み込みに失敗しました。時間をおいて再度お試しください。</p>
      )}

      {state === "loaded" && spot && (
        <article
          style={{
            background: "#fff",
            border: "1px solid #e6e8eb",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <h1 style={{ fontSize: 24, marginTop: 0 }}>{spot.name}</h1>

          <div style={dtStyle}>住所</div>
          <p style={ddStyle}>{spot.address}</p>

          {spot.bill_types.length > 0 && (
            <>
              <div style={dtStyle}>対応紙幣</div>
              <p style={ddStyle}>{spot.bill_types.map((b) => b.name).join(" / ")}</p>
            </>
          )}

          {spot.description && (
            <>
              <div style={dtStyle}>メモ</div>
              <p style={{ ...ddStyle, whiteSpace: "pre-wrap" }}>{spot.description}</p>
            </>
          )}

          <div style={dtStyle}>最終確認日</div>
          <p style={ddStyle}>{spot.last_confirmed_on ?? "未確認"}</p>

          {meId === spot.user_id && (
            <p style={{ marginTop: 16, display: "flex", gap: 16, alignItems: "center" }}>
              <Link href={`/spots/${spot.id}/edit`}>編集する</Link>
              <button
                onClick={handleDelete}
                style={{
                  background: "none",
                  border: "none",
                  color: "#c5221f",
                  cursor: "pointer",
                  padding: 0,
                  font: "inherit",
                  textDecoration: "underline",
                }}
              >
                削除する
              </button>
            </p>
          )}
        </article>
      )}
    </main>
  );
}

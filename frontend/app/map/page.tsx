"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

import { API_BASE } from "@/lib/api";

// Leaflet は window に依存するため SSR を無効化して読み込む
const SpotsMap = dynamic(() => import("../components/SpotsMap"), { ssr: false });

type Spot = {
  id: number;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
};

export default function MapPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/spots`);
        if (res.ok) setSpots((await res.json()) as Spot[]);
      } catch {
        // 失敗時は空の地図を表示
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const count = spots.filter((s) => s.latitude != null && s.longitude != null).length;

  return (
    <main className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h1 style={{ fontSize: 26, margin: 0 }}>地図</h1>
        <Link href="/spots">一覧で見る</Link>
      </div>

      {loaded ? (
        <SpotsMap spots={spots} />
      ) : (
        <p style={{ color: "#555" }}>読み込み中…</p>
      )}

      <p style={{ color: "#888", fontSize: 13, marginTop: 8 }}>
        位置が登録されたスポット（{count}件）を表示しています。
      </p>
    </main>
  );
}

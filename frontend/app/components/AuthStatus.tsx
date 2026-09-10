"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { API_BASE } from "@/lib/api";
import { type AuthUser, clearAuth, getToken, getUser } from "@/lib/auth";

export default function AuthStatus() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getUser());
    setReady(true);
  }, []);

  async function handleLogout() {
    const token = getToken();
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      // ログアウトはローカルのトークン破棄が本質。通信失敗は無視。
    }
    clearAuth();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  // マウント前はSSRとの差異を避けるため何も出さない
  if (!ready) return <div style={{ minHeight: 24 }} />;

  if (user) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#555", fontSize: 14 }}>{user.display_name} さん</span>
        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "1px solid #d0d4d9",
            borderRadius: 6,
            padding: "4px 12px",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}>
      <Link href="/login">ログイン</Link>
      <Link href="/register">新規登録</Link>
    </div>
  );
}

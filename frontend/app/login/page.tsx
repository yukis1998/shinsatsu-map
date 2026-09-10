"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { API_BASE } from "@/lib/api";
import { setAuth } from "@/lib/auth";

type Status = "idle" | "loading" | "error";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 16,
  border: "1px solid #d0d4d9",
  borderRadius: 8,
  marginTop: 4,
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setAuth(data.access_token, data.user);
        router.push("/");
        router.refresh();
        return;
      }
      if (res.status === 401) {
        setStatus("error");
        setMessage("メールアドレスまたはパスワードが違います。");
      } else {
        setStatus("error");
        setMessage(`ログインに失敗しました（${res.status}）。`);
      }
    } catch {
      setStatus("error");
      setMessage("通信エラーが発生しました。時間をおいて再度お試しください。");
    }
  }

  return (
    <main className="container" style={{ maxWidth: 440 }}>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>ログイン</h1>

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
          メールアドレス
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          パスワード
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {status === "loading" ? "ログイン中…" : "ログイン"}
        </button>

        {message && (
          <p role="status" style={{ margin: 0, color: "#c5221f", fontWeight: 600 }}>
            {message}
          </p>
        )}
      </form>

      <p style={{ marginTop: 16, color: "#555" }}>
        アカウントがない方は <Link href="/register">新規登録</Link> ／{" "}
        <Link href="/">トップへ</Link>
      </p>
    </main>
  );
}

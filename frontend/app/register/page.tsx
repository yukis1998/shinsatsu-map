"use client";

import Link from "next/link";
import { useState } from "react";

import { API_BASE } from "@/lib/api";

type Status = "idle" | "loading" | "success" | "error";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 16,
  border: "1px solid #d0d4d9",
  borderRadius: 8,
  marginTop: 4,
};

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, display_name: displayName, password }),
      });
      if (res.status === 201) {
        setStatus("success");
        setMessage("登録が完了しました。ログインしてください。");
      } else if (res.status === 409) {
        setStatus("error");
        setMessage("このメールアドレスは既に登録されています。");
      } else if (res.status === 422) {
        setStatus("error");
        setMessage("入力内容を確認してください（メール形式／パスワードは8文字以上）。");
      } else {
        setStatus("error");
        setMessage(`登録に失敗しました（${res.status}）。`);
      }
    } catch {
      setStatus("error");
      setMessage("通信エラーが発生しました。時間をおいて再度お試しください。");
    }
  }

  return (
    <main className="container" style={{ maxWidth: 440 }}>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>ユーザー登録</h1>
      <p style={{ color: "#555", marginTop: 0 }}>
        スポットを投稿するにはユーザー登録が必要です。
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
          表示名
          <input
            type="text"
            required
            maxLength={50}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          パスワード（8文字以上）
          <input
            type="password"
            required
            minLength={8}
            maxLength={72}
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
          {status === "loading" ? "登録中…" : "登録する"}
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
        すでに登録済みの方は <Link href="/login">ログイン</Link> ／{" "}
        <Link href="/">トップへ</Link>
      </p>
    </main>
  );
}

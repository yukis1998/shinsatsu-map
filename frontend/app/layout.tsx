import type { Metadata } from "next";
import Link from "next/link";

import AuthStatus from "./components/AuthStatus";
import "./globals.css";

export const metadata: Metadata = {
  title: "新札マップ",
  description:
    "新札が手に入るATM・銀行窓口を、現地確認済みの情報でユーザー同士が共有する地図サービス",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <header className="site-header">
          <Link href="/" className="brand">
            新札マップ
          </Link>
          <AuthStatus />
        </header>
        {children}
      </body>
    </html>
  );
}

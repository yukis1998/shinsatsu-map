import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}

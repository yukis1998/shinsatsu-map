import type { Metadata } from "next";
import Link from "next/link";

import AuthStatus from "./components/AuthStatus";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://shinsatsu-map.vercel.app"),
  title: "新札マップ",
  description:
    "新札が手に入るATM・銀行窓口を、現地確認済みの情報でユーザー同士が共有する地図サービス",
  openGraph: {
    title: "新札マップ",
    description:
      "新札が「今そこで手に入る」場所を、現地確認済みの情報で共有する地図サービス",
    url: "https://shinsatsu-map.vercel.app",
    siteName: "新札マップ",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "新札マップ",
    description:
      "新札が「今そこで手に入る」場所を、現地確認済みの情報で共有する地図サービス",
  },
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

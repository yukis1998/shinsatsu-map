import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container">
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, margin: "0 0 8px" }}>新札マップ</h1>
        <p style={{ fontSize: 18, color: "#555", margin: 0 }}>
          新札が「今そこで手に入る」場所を、現地確認済みの情報で共有する地図サービス
        </p>
      </header>

      <section
        style={{
          background: "#fff",
          border: "1px solid #e6e8eb",
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <p style={{ marginTop: 0 }}>
          冠婚葬祭やお年玉で急に新札が必要になったとき、どこで手に入るか現地に行くまで
          分からず、何軒も探し回る——。新札マップは、実際に確認できたスポットを地図と一覧で
          共有し、無駄足なく目的地にたどり着けるようにします。
        </p>
        <ul style={{ margin: "12px 0 0", paddingLeft: 20, color: "#555" }}>
          <li>閲覧は登録不要ですぐ使える</li>
          <li>スポットの投稿はログインしたユーザーのみ（情報の信頼性確保のため）</li>
          <li>最終確認日で情報の鮮度が分かる</li>
        </ul>
      </section>

      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link
          href="/spots"
          style={{
            background: "#1f6feb",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          スポットを見る
        </Link>
        <Link
          href="/spots/new"
          style={{
            background: "#fff",
            color: "#1f6feb",
            padding: "12px 20px",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
            border: "1px solid #1f6feb",
          }}
        >
          スポットを投稿する
        </Link>
      </nav>
    </main>
  );
}

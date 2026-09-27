import { ImageResponse } from "next/og";

import { SITE_HOST } from "@/lib/site";

// SNS 共有時に表示される OGP 画像（1200x630）を動的生成する。
export const runtime = "edge";
export const alt = "新札マップ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 日本語グリフのため、描画する文字だけを部分取得（&text=）して Noto Sans JP を読み込む。
async function loadGoogleFont(text: string): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
  if (!src) throw new Error("font url not found");
  const res = await fetch(src[1]);
  if (!res.ok) throw new Error("font fetch failed");
  return res.arrayBuffer();
}

export default async function OgImage() {
  const title = "新札マップ";
  const subtitle = "新札が「今そこで手に入る」場所を、現地確認済みで共有する地図サービス";
  const url = SITE_HOST;
  const font = await loadGoogleFont(title + subtitle + url);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#f7f8fa",
          fontFamily: "Noto Sans JP",
        }}
      >
        <div style={{ fontSize: 100, fontWeight: 700, color: "#0b1f44" }}>{title}</div>
        <div style={{ fontSize: 38, color: "#44506b", marginTop: 28, lineHeight: 1.4 }}>
          {subtitle}
        </div>
        <div style={{ fontSize: 30, color: "#1f6feb", marginTop: 48 }}>{url}</div>
      </div>
    ),
    { ...size, fonts: [{ name: "Noto Sans JP", data: font, weight: 700, style: "normal" }] },
  );
}

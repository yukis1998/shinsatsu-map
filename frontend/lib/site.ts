/**
 * サイトの公開URL（1か所で管理）。
 * 独自ドメイン設定時は Vercel の環境変数 NEXT_PUBLIC_SITE_URL を設定すれば、
 * metadata・OGP など全体に反映される（コード変更不要）。未設定なら現行の Vercel URL。
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://shinsatsu-map.vercel.app";

/** 表示用のホスト名（例: shinsatsu-map.vercel.app）。 */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");

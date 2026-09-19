/** 今日のローカル日付を YYYY-MM-DD で返す（日付入力の max や未来日チェックに使用）。 */
export function todayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

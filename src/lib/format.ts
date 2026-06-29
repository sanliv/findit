export function formatDateTime(value?: string | null) {
  if (!value) return "待填写";
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function displayValue(value?: string | null, fallback = "待填写") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

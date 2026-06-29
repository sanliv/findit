import { ChevronDown, MapPin } from "lucide-react";

export function LocationSelector({ value = "上海市 > 浦东新区 > 世纪大道" }: { value?: string }) {
  return (
    <button
      type="button"
      className="flex h-12 w-full items-center gap-3 rounded-2xl border border-[var(--color-primary-border)] bg-white px-4 text-left text-sm font-semibold text-[#252525] shadow-card"
    >
      <MapPin className="h-5 w-5 shrink-0 text-[var(--color-primary)]" />
      <span className="min-w-0 flex-1 truncate">{value}</span>
      <ChevronDown className="h-4 w-4 text-[#666]" />
    </button>
  );
}

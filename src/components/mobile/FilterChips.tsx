import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export function FilterChips({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const chips = ["全部", "狗狗", "猫咪", "其他"];
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {chips.map((chip) => (
        <button
          key={chip}
          type="button"
          onClick={() => onChange(chip)}
          className={cn(
            "h-10 shrink-0 rounded-xl border border-[#dfe5eb] bg-white px-4 text-sm font-bold text-[#374151] shadow-sm",
            value === chip && "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
          )}
        >
          {chip}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange("全部")}
        className="flex h-10 shrink-0 items-center gap-1 rounded-xl border border-[var(--color-primary-border)] bg-white px-3 text-sm font-bold text-[var(--color-primary-dark)] shadow-sm"
      >
        <SlidersHorizontal className="h-4 w-4" />
        筛选
      </button>
    </div>
  );
}

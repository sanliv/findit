import { Search } from "lucide-react";

export function SearchBar({
  value,
  onChange,
  placeholder = "搜索宠物品种 / 颜色 / 特征 / 地点"
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="relative block">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7a8794]" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-14 w-full rounded-2xl border border-[#ffd2b3] bg-white pl-12 pr-4 text-[15px] shadow-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
      />
    </label>
  );
}

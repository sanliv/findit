import { List, Map } from "lucide-react";
import { cn } from "@/lib/utils";

export function ViewToggle({ value, onChange }: { value: "list" | "map"; onChange: (value: "list" | "map") => void }) {
  return (
    <div className="inline-grid h-10 grid-cols-2 rounded-xl bg-[#fff0e5] p-1">
      {[
        { key: "list" as const, label: "列表", icon: List },
        { key: "map" as const, label: "地图", icon: Map }
      ].map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          className={cn(
            "flex items-center justify-center gap-1 rounded-lg px-3 text-sm font-black text-[#53606d]",
            value === item.key && "bg-[var(--color-primary)] text-white shadow-sm"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </button>
      ))}
    </div>
  );
}

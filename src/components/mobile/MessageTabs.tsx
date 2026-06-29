import { cn } from "@/lib/utils";
import type { MobileMessage } from "@/lib/mobile-api";

export type MessageTab = "全部" | "线索" | "私信" | "通知";

export function MessageTabs({ value, onChange, messages }: { value: MessageTab; onChange: (value: MessageTab) => void; messages: MobileMessage[] }) {
  const tabs: MessageTab[] = ["全部", "线索", "私信", "通知"];
  const count = (tab: MessageTab) => messages.filter((message) => message.unread && (tab === "全部" || tabOf(message) === tab)).length;
  return (
    <div className="grid grid-cols-4 gap-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn("relative h-11 rounded-2xl bg-white text-sm font-black text-[#5b6572]", value === tab && "bg-[var(--color-primary)] text-white")}
        >
          {tab}
          {count(tab) > 0 && <span className={cn("ml-1 rounded-full px-1.5 py-0.5 text-[10px]", value === tab ? "bg-white/25 text-white" : "bg-[var(--color-lost)] text-white")}>{count(tab)}</span>}
        </button>
      ))}
    </div>
  );
}

export function tabOf(message: MobileMessage): MessageTab {
  if (message.type === "clue") return "线索";
  if (message.type === "chat") return "私信";
  return "通知";
}

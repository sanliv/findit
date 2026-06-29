import { PawPrint } from "lucide-react";

export function EmptyState({
  title = "暂无内容",
  description = "换个筛选条件试试。",
  action
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#e5d9cc] bg-white/70 px-6 text-center shadow-card">
      <PawPrint className="mb-3 h-11 w-11 text-primary/55" />
      <p className="text-xl font-black">{title}</p>
      <p className="mt-2 text-sm text-[#756a60]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

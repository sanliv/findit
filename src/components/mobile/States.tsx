import { AlertCircle, Loader2, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadingState({ text = "正在加载..." }: { text?: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-3xl bg-white text-[#6b7280]">
      <Loader2 className="mb-3 h-7 w-7 animate-spin text-[var(--color-primary)]" />
      <p className="text-sm font-semibold">{text}</p>
    </div>
  );
}

export function EmptyState({ title = "暂无数据", description = "换个条件试试。", action }: { title?: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--color-primary-border)] bg-white p-6 text-center">
      <PawPrint className="mb-3 h-10 w-10 text-[var(--color-primary)]" />
      <h3 className="text-lg font-black text-[#111827]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#6b7280]">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-3xl border border-red-100 bg-red-50 p-5 text-center">
      <AlertCircle className="mx-auto mb-2 h-8 w-8 text-[var(--color-lost)]" />
      <p className="text-sm font-semibold text-red-700">{message}</p>
      {onRetry && <Button className="mt-3" size="sm" onClick={onRetry}>重试</Button>}
    </div>
  );
}

import { cn } from "@/lib/utils";

export function StatusBadge({ status, kind }: { status?: string; kind?: "lost" | "found" }) {
  const label =
    status === "removed"
      ? "已下架"
      : status === "found" || status === "reunited"
        ? "已解决"
        : kind === "found"
          ? "待领养"
          : "寻宠中";

  const color =
    label === "已解决"
      ? "bg-[var(--color-success)]"
      : label === "待领养"
        ? "bg-[var(--color-found)]"
        : label === "已下架"
          ? "bg-[var(--color-gray)]"
          : "bg-[var(--color-lost)]";

  return <span className={cn("inline-flex rounded-lg px-2.5 py-1 text-xs font-black text-white", color)}>{label}</span>;
}

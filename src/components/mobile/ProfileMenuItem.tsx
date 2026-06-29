import { ChevronRight } from "lucide-react";

export function ProfileMenuItem({ icon: Icon, title, desc, onClick }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-14 w-full items-center gap-3 border-b border-[#fff0e5] py-3 text-left last:border-0">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-black text-[#111827]">{title}</span>
        <span className="mt-0.5 block truncate text-sm text-[#7a8490]">{desc}</span>
      </span>
      <ChevronRight className="h-5 w-5 text-[#9ca3af]" />
    </button>
  );
}

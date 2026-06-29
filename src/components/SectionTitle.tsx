import { LucideIcon } from "lucide-react";

export function SectionTitle({ title, action, icon: Icon }: { title: string; action?: React.ReactNode; icon?: LucideIcon }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-2xl font-black">
        {Icon && <Icon className="h-7 w-7 text-primary" fill="currentColor" />}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

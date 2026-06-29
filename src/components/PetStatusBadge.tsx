import { Badge } from "@/components/ui/badge";
import { type PetStatus } from "@/data/pets";

const config: Record<PetStatus, { label: string; className: string }> = {
  searching: { label: "寻找中", className: "border-primary/30 bg-orange-50 text-primary" },
  clue: { label: "有线索", className: "border-blue-200 bg-blue-50 text-clue" },
  found: { label: "已找回", className: "border-green-200 bg-green-50 text-success" },
  urgent: { label: "紧急", className: "border-red-200 bg-red-50 text-urgent" }
};

export function PetStatusBadge({ status }: { status: PetStatus }) {
  const item = config[status];
  return <Badge className={item.className}>{item.label}</Badge>;
}

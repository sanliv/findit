"use client";

import { Bot, Edit3, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SafePetImage } from "@/components/SafePetImage";
import { StatusBadge } from "@/components/mobile/StatusBadge";
import type { FoundPet, LostPet } from "@/lib/local-store";

type MyPostItem = ({ kind: "lost"; pet: LostPet } | { kind: "found"; pet: FoundPet }) & { removed?: boolean };

export function MyPostCard({ item, onEdit, onRemove, onMatch }: { item: MyPostItem; onEdit: () => void; onRemove: () => void; onMatch: () => void }) {
  const pet = item.pet;
  const href = item.kind === "lost" ? `/pet-detail/?id=${encodeURIComponent(pet.id)}` : `/found-detail/?id=${encodeURIComponent(pet.id)}`;
  const location = item.kind === "lost" ? item.pet.location : item.pet.foundLocation;
  const title = item.kind === "lost" ? `${pet.breed || item.pet.name}（${pet.gender || "未知"}）` : `${pet.breed || pet.type}（${pet.gender || "未知"}）`;
  const clueCount = item.kind === "lost" ? item.pet.clues.length : 0;
  const matchCount = pet.matchInfo?.candidates.length ?? (pet.aiInfo ? 3 : 0);

  return (
    <article className="border-b border-[#ffe0c2] bg-white py-3 last:border-b-0">
      <div className="grid grid-cols-[82px_1fr] gap-3">
        <SafePetImage src={pet.images[0] || ""} alt={title} className="h-22 rounded-2xl" />
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <StatusBadge kind={item.kind} status={item.removed ? "removed" : ("status" in pet ? pet.status : undefined)} />
              <h3 className="truncate font-black">{title}</h3>
            </div>
            <Button type="button" variant="outline" size="sm" className="h-8 shrink-0 rounded-xl border-[var(--color-primary-border)] px-2 text-xs text-[var(--color-primary)]" onClick={onMatch}>
              <Bot className="h-3.5 w-3.5" />AI匹配
            </Button>
          </div>
          <p className="mt-1 truncate text-xs text-[#666]">{location}</p>
          <p className="mt-1 text-xs text-[#666]">线索 {clueCount} · AI匹配 {matchCount}</p>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" className="h-8 rounded-xl text-xs" onClick={onEdit}><Edit3 className="h-3.5 w-3.5" />编辑</Button>
            <Button type="button" variant="outline" size="sm" className="h-8 rounded-xl text-xs text-[var(--color-danger)]" onClick={onRemove}><Trash2 className="h-3.5 w-3.5" />下架</Button>
            <a href={href}><Button type="button" size="sm" className="h-8 rounded-xl bg-[var(--color-primary)] text-xs hover:bg-[var(--color-primary-dark)]"><Eye className="h-3.5 w-3.5" />查看详情</Button></a>
          </div>
        </div>
      </div>
    </article>
  );
}

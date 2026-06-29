"use client";

import { Heart, MapPin, Phone } from "lucide-react";
import { SafePetImage } from "@/components/SafePetImage";
import { StatusBadge } from "@/components/mobile/StatusBadge";
import { cn } from "@/lib/utils";
import type { FoundPet, LostPet } from "@/lib/local-store";

export function MobilePetCard({
  item,
  favorite,
  onFavorite,
  onContact
}: {
  item: { kind: "lost"; pet: LostPet } | { kind: "found"; pet: FoundPet };
  favorite: boolean;
  onFavorite: () => void;
  onContact: () => void;
}) {
  const pet = item.pet;
  const isLost = item.kind === "lost";
  const title = isLost ? `${pet.breed || item.pet.name || pet.type}（${pet.gender || "未知"}）` : `${pet.breed || pet.type}（${pet.gender || "未知"}）`;
  const location = isLost ? item.pet.location : item.pet.foundLocation;
  const time = isLost ? item.pet.lostTime : item.pet.foundTime;
  const href = isLost ? `/pet-detail/?id=${encodeURIComponent(pet.id)}` : `/found-detail/?id=${encodeURIComponent(pet.id)}`;
  const tags = [pet.breed || pet.type, pet.gender, isLost ? item.pet.age : "成年", pet.color].filter(Boolean).slice(0, 3);

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--color-primary-border)] bg-white shadow-card">
      <a href={href} className="block">
        <div className="relative">
          <SafePetImage src={pet.images[0] || ""} alt={title} className="h-32 w-full rounded-b-none rounded-t-2xl" />
          <span className="absolute right-2 top-2">
            <StatusBadge status={"status" in pet ? pet.status : undefined} kind={item.kind} />
          </span>
        </div>
        <div className="p-3">
          <h3 className="truncate text-base font-black text-[#252525]">{title}</h3>
          <div className="mt-1 flex items-center justify-between gap-2 text-xs text-[#666]">
            <span className="flex min-w-0 items-center gap-1 truncate">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]" />
              {location.replace("上海市", "").trim() || location}
            </span>
            <span className="shrink-0">{time ? time.split(" ")[0].slice(5).replace("-", "/") : "刚刚"}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-[var(--color-primary-light)] px-2 py-0.5 text-[11px] font-semibold text-[#5f4a38]">{tag}</span>
            ))}
          </div>
        </div>
      </a>
      <div className="flex items-center justify-end gap-2 px-3 pb-3">
        <button
          type="button"
          aria-label="收藏"
          onClick={onFavorite}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-primary-border)] bg-white text-[#666]"
        >
          <Heart className={cn("h-5 w-5", favorite && "fill-[var(--color-primary)] text-[var(--color-primary)]")} />
        </button>
        <button
          type="button"
          aria-label="联系发布者"
          onClick={onContact}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-primary-border)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
        >
          <Phone className="h-5 w-5" />
        </button>
      </div>
    </article>
  );
}

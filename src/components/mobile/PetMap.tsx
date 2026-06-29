"use client";

import { MapPin } from "lucide-react";
import { SafePetImage } from "@/components/SafePetImage";
import { StatusBadge } from "@/components/mobile/StatusBadge";
import type { FoundPet, LostPet } from "@/lib/local-store";

export function PetMap({
  items,
  selectedId,
  onSelect
}: {
  items: Array<{ kind: "lost"; pet: LostPet } | { kind: "found"; pet: FoundPet }>;
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const selected = items.find((item) => item.pet.id === selectedId) ?? items[0];
  return (
    <div className="relative h-[60vh] min-h-[420px] overflow-hidden rounded-3xl border border-[var(--color-primary-border)] bg-[var(--color-primary-soft)]">
      <div className="map-grid absolute inset-0 opacity-80" />
      {items.slice(0, 10).map((item, index) => {
        const x = "coordinates" in item.pet && item.pet.coordinates ? item.pet.coordinates.x : 18 + (index * 17) % 68;
        const y = "coordinates" in item.pet && item.pet.coordinates ? item.pet.coordinates.y : 20 + (index * 13) % 58;
        const active = item.pet.id === selected?.pet.id;
        return (
          <button
            key={item.pet.id}
            type="button"
            onClick={() => onSelect(item.pet.id)}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg ring-8 ${active ? "scale-125 bg-[var(--color-primary-dark)] ring-[var(--color-primary)]/20" : "bg-[var(--color-primary)] ring-white/80"}`}>
              <MapPin className="h-6 w-6" fill="currentColor" />
            </span>
          </button>
        );
      })}
      {selected && (
        <div className="absolute bottom-4 left-4 right-4 z-20 grid grid-cols-[74px_1fr] gap-3 rounded-3xl bg-white p-3 shadow-[0_12px_32px_rgba(31,50,69,.16)]">
          <SafePetImage src={selected.pet.images[0] || ""} alt={selected.pet.breed || selected.pet.type} className="h-20 rounded-2xl" />
          <div className="min-w-0">
            <StatusBadge kind={selected.kind} status={"status" in selected.pet ? selected.pet.status : undefined} />
            <h3 className="mt-1 truncate font-black">{selected.pet.breed || selected.pet.type}</h3>
            <p className="mt-1 truncate text-sm text-[#667085]">{"location" in selected.pet ? selected.pet.location : selected.pet.foundLocation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

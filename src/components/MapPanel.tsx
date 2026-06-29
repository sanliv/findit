"use client";

import { LocateFixed, Minus, PawPrint, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SafePetImage } from "@/components/SafePetImage";
import { PetStatusBadge } from "@/components/PetStatusBadge";
import { type LostPet } from "@/lib/local-store";
import { cn } from "@/lib/utils";

export function MapPanel({
  pets,
  selectedId,
  onSelect,
  small,
  nearbyOnly = false,
  onNearbyOnlyChange
}: {
  pets: LostPet[];
  selectedId?: string;
  onSelect?: (pet: LostPet) => void;
  small?: boolean;
  nearbyOnly?: boolean;
  onNearbyOnlyChange?: (nearbyOnly: boolean) => void;
}) {
  const visiblePets = nearbyOnly ? pets.slice(0, 5) : pets;
  const selected = visiblePets.find((pet) => pet.id === selectedId) ?? visiblePets[0];

  return (
    <div className={cn("relative overflow-hidden rounded-[22px] border border-[#d8e5dc] bg-[#dff2e9] map-grid shadow-card", small ? "h-[180px]" : "h-[680px] max-lg:h-[60vh]")}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(75,168,229,.35),transparent_21rem),radial-gradient(circle_at_58%_55%,rgba(255,106,0,.13),transparent_14rem)]" />
      {!small && (
        <div className="absolute right-6 top-6 z-10 flex rounded-xl border border-[#e3d8cc] bg-white p-1 shadow-card">
          <button
            type="button"
            onClick={() => onNearbyOnlyChange?.(false)}
            className={cn("rounded-lg px-5 py-2 text-sm font-bold transition", !nearbyOnly ? "bg-orange-50 text-primary" : "hover:bg-orange-50")}
          >
            全部
          </button>
          <button
            type="button"
            onClick={() => onNearbyOnlyChange?.(true)}
            className={cn("rounded-lg px-5 py-2 text-sm font-bold transition", nearbyOnly ? "bg-orange-50 text-primary" : "hover:bg-orange-50")}
          >
            仅附近
          </button>
        </div>
      )}
      {visiblePets.map((pet) => {
        const active = pet.id === selected?.id;
        return (
          <button
            key={pet.id}
            type="button"
            onClick={() => onSelect?.(pet)}
            className={cn(
              "absolute z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-[0_8px_22px_rgba(255,106,0,.28)] transition",
              pet.status === "found" ? "bg-success" : pet.status === "clue" ? "bg-clue" : pet.status === "urgent" ? "bg-urgent" : "bg-primary",
              active && "h-16 w-16 ring-[18px] ring-primary/15"
            )}
            style={{ left: `${pet.coordinates.x}%`, top: `${pet.coordinates.y}%` }}
          >
            <PawPrint className={cn("h-6 w-6", active && "h-9 w-9")} fill="currentColor" />
          </button>
        );
      })}
      {selected && !small && (
        <div className="absolute left-[54%] top-[42%] z-20 grid w-[320px] grid-cols-[76px_1fr] gap-3 rounded-2xl border border-[#eadfd3] bg-white p-3 shadow-soft max-md:left-6 max-md:top-auto max-md:bottom-6 max-md:w-[calc(100%-48px)]">
          <SafePetImage src={selected.images[0]} alt={selected.name} className="h-20 rounded-xl" />
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-lg font-black">{selected.name}</h3>
              <PetStatusBadge status={selected.status} />
            </div>
            <p className="mt-1 truncate text-sm text-[#5b5148]">{selected.location}</p>
            <a href={`/pet-detail/?id=${encodeURIComponent(selected.id)}`} className="mt-2 inline-block">
              <Button size="sm" variant="outline">查看详情</Button>
            </a>
          </div>
        </div>
      )}
      <div className="absolute bottom-8 right-8 z-10 overflow-hidden rounded-xl border border-[#d8d0c8] bg-white shadow-card">
        <button type="button" className="flex h-11 w-11 items-center justify-center border-b"><LocateFixed className="h-5 w-5" /></button>
        <button type="button" className="flex h-11 w-11 items-center justify-center border-b"><Plus className="h-5 w-5" /></button>
        <button type="button" className="flex h-11 w-11 items-center justify-center"><Minus className="h-5 w-5" /></button>
      </div>
    </div>
  );
}

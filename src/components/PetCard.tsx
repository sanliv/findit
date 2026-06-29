"use client";

import { Clock, MapPin, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PetStatusBadge } from "@/components/PetStatusBadge";
import { SafePetImage } from "@/components/SafePetImage";
import { type LostPet } from "@/lib/local-store";
import { cn } from "@/lib/utils";

export function PetCard({
  pet,
  compact,
  selected,
  onSelect
}: {
  pet: LostPet;
  compact?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <Card
      onClick={onSelect}
      className={cn(
        "group grid cursor-pointer grid-cols-[132px_1fr] gap-4 rounded-[20px] p-4 transition hover:border-primary/60 hover:shadow-soft max-sm:grid-cols-1",
        compact && "grid-cols-[128px_1fr] gap-4 p-4 max-sm:grid-cols-1",
        selected && "border-primary shadow-[0_0_0_1px_#FF6A00,0_12px_30px_rgba(255,106,0,.12)]"
      )}
    >
      <SafePetImage src={pet.images[0]} alt={pet.name} className={cn("h-36 w-full rounded-2xl", compact && "h-36")} />
      <div className="min-w-0">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-xl font-black leading-tight">{pet.name}</h3>
            <p className="mt-1 text-sm leading-5 text-[#5c534b]">{pet.type} / {pet.breed} / {pet.gender} / {pet.age}</p>
          </div>
          <PetStatusBadge status={pet.status} />
        </div>
        <div className="space-y-1.5 text-sm text-[#5c534b]">
          <p className="flex items-start gap-1.5 leading-5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{pet.location}</span>
          </p>
          <p className="flex items-start gap-1.5 leading-5">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{pet.lostTime}</span>
          </p>
          <p className="flex items-start gap-1.5 leading-5">
            <PawPrint className="mt-0.5 h-4 w-4 shrink-0 text-primary" fill="currentColor" />
            <span>{pet.traits}</span>
          </p>
        </div>
        <div className="mt-3 flex justify-end" onClick={(event) => event.stopPropagation()}>
          <a href={`/pet-detail/?id=${encodeURIComponent(pet.id)}`}>
            <Button variant="secondary" size="sm">查看详情</Button>
          </a>
        </div>
      </div>
    </Card>
  );
}

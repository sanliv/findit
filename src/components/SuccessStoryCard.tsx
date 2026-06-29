import { CheckCircle2, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PetStatusBadge } from "@/components/PetStatusBadge";
import { SafePetImage } from "@/components/SafePetImage";
import { type LostPet } from "@/lib/local-store";

export function SuccessStoryCard({ pet }: { pet: LostPet }) {
  return (
    <Card className="grid grid-cols-[150px_1fr] gap-4 p-3">
      <SafePetImage src={pet.images[0]} alt={pet.name} className="h-32 rounded-xl" />
      <div className="min-w-0">
        <div className="flex justify-between gap-2">
          <h3 className="text-xl font-black">{pet.name}</h3>
          <PetStatusBadge status="found" />
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-sm"><MapPin className="h-4 w-4 text-success" />走失地点：{pet.location}</p>
        <p className="mt-1 text-sm">走失时间：{pet.lostTime}</p>
        <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-success">
          <CheckCircle2 className="h-4 w-4" />{pet.description}
        </p>
      </div>
    </Card>
  );
}

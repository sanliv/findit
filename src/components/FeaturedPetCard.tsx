import { ArrowRight, MapPin, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PetStatusBadge } from "@/components/PetStatusBadge";
import { SafePetImage } from "@/components/SafePetImage";
import { type LostPet } from "@/lib/local-store";

export function FeaturedPetCard({ pet }: { pet: LostPet }) {
  return (
    <Card className="grid grid-cols-[42%_1fr] gap-7 p-2 shadow-soft">
      <SafePetImage src={pet.images[0]} alt={pet.name} className="h-[320px] rounded-[18px]" />
      <div className="flex flex-col justify-center pr-7">
        <PetStatusBadge status={pet.status} />
        <h2 className="mt-3 text-5xl font-black leading-none">{pet.name}</h2>
        <p className="mt-3 text-xl">{pet.breed} / {pet.gender} / {pet.age}</p>
        <div className="mt-5 space-y-3 text-lg text-[#403831]">
          <p className="flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" fill="currentColor" />{pet.location}</p>
          <p className="flex items-center gap-3"><Clock className="h-5 w-5 text-primary" />{pet.lostTime}</p>
          <p className="flex items-center gap-3"><Tag className="h-5 w-5 text-primary" />{pet.traits}</p>
        </div>
        <a href={`/pet-detail/?id=${encodeURIComponent(pet.id)}`} className="mt-6">
          <Button variant="outline" className="w-full text-lg">
            查看详情 <ArrowRight className="h-5 w-5" />
          </Button>
        </a>
      </div>
    </Card>
  );
}

import { Button } from "@/components/ui/button";
import { SafePetImage } from "@/components/SafePetImage";
import type { PetMatchResult } from "@/lib/ai/types";

export function MatchPetCard({ match }: { match: PetMatchResult }) {
  const href = match.pet.kind === "lost" ? `/pet-detail/?id=${encodeURIComponent(match.pet.id)}` : `/found-detail/?id=${encodeURIComponent(match.pet.id)}`;
  return (
    <div className="min-w-[132px] max-w-[150px] overflow-hidden rounded-2xl border border-[var(--color-primary-border)] bg-white shadow-card">
      <a href={href} className="block">
        <div className="relative">
          <SafePetImage src={match.pet.images[0] || ""} alt={match.pet.name || match.pet.breed || match.pet.type} className="h-24 w-full rounded-b-none rounded-t-2xl" />
          <span className="absolute right-2 top-2 rounded-full bg-[var(--color-primary)] px-2 py-1 text-[11px] font-black text-white">{match.score}%相似</span>
        </div>
        <div className="p-2.5">
          <h4 className="truncate text-sm font-black">{match.pet.name || match.pet.breed || match.pet.type}</h4>
          <p className="mt-1 truncate text-xs text-[#666]">{match.pet.location}</p>
          <p className="text-xs text-[#666]">{match.pet.time}</p>
          <Button size="sm" variant="outline" className="mt-2 h-8 w-full rounded-xl text-xs">查看详情</Button>
        </div>
      </a>
    </div>
  );
}

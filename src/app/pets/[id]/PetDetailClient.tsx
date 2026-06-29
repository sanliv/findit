"use client";

import Link from "next/link";
import { AlertTriangle, Clock, Gift, Loader2, MapPin, PawPrint, Phone, Share2, Sparkles, Tag, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPanel } from "@/components/MapPanel";
import { PetCard } from "@/components/PetCard";
import { PetStatusBadge } from "@/components/PetStatusBadge";
import { SafePetImage } from "@/components/SafePetImage";
import { SiteHeader } from "@/components/SiteHeader";
import { MobilePetDetail } from "@/components/mobile/MobilePetDetail";
import type { PetMatchResult } from "@/lib/ai/types";
import { getLostPetItem, listLostPetItems, matchPet } from "@/lib/api";
import type { LostPet } from "@/lib/local-store";
import { cn } from "@/lib/utils";

export function PetDetailClient({ id }: { id?: string }) {
  const [pet, setPet] = useState<LostPet | null>(null);
  const [allPets, setAllPets] = useState<LostPet[]>([]);
  const [mainImage, setMainImage] = useState("");
  const [aiMatches, setAiMatches] = useState<PetMatchResult[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    const activeId = id ?? getPetIdFromLocation();
    try {
      const [detail, lost] = await Promise.all([getLostPetItem(activeId), listLostPetItems()]);
      setAllPets(lost);
      setPet(detail);
      setMainImage(detail?.images[0] || "");
    } catch {
      setAllPets([]);
      setPet(null);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => { void load(); }, [id]);

  const similar = useMemo(() => {
    if (!pet) return [];
    return allPets.filter((item) => item.id !== pet.id && item.type === pet.type && item.status !== "found").slice(0, 2);
  }, [allPets, pet]);

  const share = async () => {
    await navigator.clipboard?.writeText(window.location.href);
    toast.success("链接已复制，可以分享给朋友了。");
  };

  const runAIMatch = async () => {
    if (!pet) return;
    setMatchLoading(true);
    setMatchError("");
    try {
      const result = await matchPet(pet.id);
      setAiMatches(result.matches ?? []);
      if (result.matches?.length) toast.success(`AI 已找到 ${result.matches.length} 条相似宠物信息`);
      else toast.message("暂未找到相似宠物，请稍后再试或扩大搜索范围。");
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI 匹配失败，请稍后再试。";
      setMatchError(message);
      toast.error(message);
    } finally {
      setMatchLoading(false);
    }
  };

  if (loaded && !pet) {
    return (
      <>
        <SiteHeader />
        <main className="container-page py-16">
          <Card className="p-10 text-center">
            <h1 className="text-3xl font-black">没有找到这条寻宠信息</h1>
            <Link href="/nearby" className="mt-5 inline-block"><Button>返回附近宠物</Button></Link>
          </Card>
        </main>
      </>
    );
  }
  if (!pet) return null;

  return (
    <>
      <MobilePetDetail id={pet.id} />
      <div className="hidden md:block">
        <SiteHeader />
        <main className="py-8">
          <div className="container-page">
            <div className="mb-4 text-sm font-semibold text-[#6d6258]"><Link href="/nearby">附近宠物</Link> <span className="mx-3">/</span> 宠物详情</div>
            <div className="grid grid-cols-[620px_1fr] gap-8">
              <section>
                <SafePetImage src={mainImage || pet.images[0]} alt={pet.name} className="h-[420px] w-full rounded-2xl shadow-card" />
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {pet.images.map((image) => (
                    <button key={image} onClick={() => setMainImage(image)} className={cn("overflow-hidden rounded-xl border-2", image === (mainImage || pet.images[0]) ? "border-primary" : "border-transparent")}>
                      <SafePetImage src={image} alt={pet.name} className="h-24 w-full" />
                    </button>
                  ))}
                </div>
              </section>
              <Card className="p-8">
                <PetStatusBadge status={pet.status} />
                <h1 className="mt-3 text-5xl font-black">{pet.name}</h1>
                <p className="mt-3 text-xl">{pet.breed} / {pet.gender} / {pet.age}</p>
                <div className="mt-6 divide-y text-base">
                  <Info icon={<Clock />} label="走失时间" value={pet.lostTime} />
                  <Info icon={<MapPin />} label="最后出现地点" value={pet.location} />
                  <Info icon={<PawPrint />} label="明显特征" value={pet.traits} />
                  <Info icon={<UserRound />} label="联系人" value={pet.contactName} />
                  <Info icon={<Phone />} label="联系方式" value={pet.contactPhone} />
                  <Info icon={<Gift />} label="悬赏金额" value={pet.reward} />
                </div>
                <Button size="lg" variant="outline" onClick={share} className="mt-6 w-full"><Share2 className="h-5 w-5" />分享给朋友</Button>
                <p className="mt-5 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-[#9b6b12]"><AlertTriangle className="h-5 w-5" />如果发现疑似宠物，请不要惊吓它，先拍照并联系主人。</p>
              </Card>
            </div>

            <div className="mt-6 grid grid-cols-[1fr_560px] gap-8">
              <div className="space-y-5">
                <Card className="p-5"><h2 className="mb-4 flex items-center gap-2 text-xl font-black"><MapPin className="h-5 w-5 text-primary" fill="currentColor" />最后出现位置</h2><MapPanel pets={[pet]} selectedId={pet.id} small /></Card>
                <Card className="p-5"><h2 className="mb-3 flex items-center gap-2 text-xl font-black"><Tag className="h-5 w-5 text-primary" />详细描述</h2><p className="leading-8 text-[#4f463e]">{pet.description || "主人暂未填写更多描述。"}</p></Card>
              </div>
              <div className="space-y-5">
                <Card className="p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="flex items-center gap-2 text-xl font-black"><Sparkles className="h-5 w-5 text-primary" />AI匹配相似宠物</h2>
                    <Button type="button" size="sm" onClick={runAIMatch} disabled={matchLoading}>{matchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{matchLoading ? "正在匹配..." : "开始匹配"}</Button>
                  </div>
                  {matchError && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">{matchError}</p>}
                  {!matchError && !aiMatches.length && <p className="rounded-xl bg-orange-50 p-4 text-sm text-[#6d6258]">点击按钮后，AI 会对比待领养宠物信息，展示相似度和匹配原因。</p>}
                  <div className="space-y-3">{aiMatches.map((match) => <AIMatchCard key={match.postId} match={match} />)}</div>
                </Card>
                <Card className="p-5">
                  <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">相似宠物推荐</h2><Link href="/nearby" className="text-sm font-bold text-[#6d6258]">查看更多 &gt;</Link></div>
                  <div className="grid grid-cols-2 gap-4">{similar.map((item) => <PetCard key={item.id} pet={item} compact />)}</div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function AIMatchCard({ match }: { match: PetMatchResult }) {
  const pet = match.pet;
  const detailHref = pet.kind === "found" ? `/found-detail/?id=${encodeURIComponent(pet.id)}` : `/pet-detail/?id=${encodeURIComponent(pet.id)}`;
  return (
    <div className="grid grid-cols-[92px_1fr] gap-3 rounded-2xl border border-orange-100 bg-white p-3 shadow-sm">
      <SafePetImage src={pet.images[0] || ""} alt={pet.name || pet.breed || pet.type} className="h-24 rounded-xl" />
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2"><h3 className="truncate font-black">{pet.name || pet.breed || pet.type}</h3><span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-xs font-black text-white">相似度 {match.score}%</span></div>
        <p className="mt-1 truncate text-xs text-[#756a60]">{pet.kind === "found" ? "待领养信息" : "走失信息"} · {pet.location}</p>
        <div className="mt-2 flex flex-wrap gap-1">{match.reasons.slice(0, 3).map((reason) => <span key={reason} className="rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-[#9b5a16]">{reason}</span>)}</div>
        <a href={detailHref} className="mt-3 inline-block"><Button size="sm" variant="outline">查看详情</Button></a>
      </div>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactElement; label: string; value: string }) {
  return <div className="grid grid-cols-[180px_1fr] items-center py-3"><span className="flex items-center gap-3 text-[#4f463e]"><span className="[&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-primary">{icon}</span>{label}</span><span className="font-semibold">{value}</span></div>;
}

function getPetIdFromLocation() {
  if (typeof window === "undefined") return "";
  const searchId = new URLSearchParams(window.location.search).get("id");
  if (searchId) return searchId;
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts[0] === "pets" && parts[1] ? parts[1] : "";
}

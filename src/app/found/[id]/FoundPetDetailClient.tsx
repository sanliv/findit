"use client";

import Link from "next/link";
import { Clock, Copy, Home, Info, Loader2, MapPin, PawPrint, Phone, Share2, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/EmptyState";
import { PhotoUploader } from "@/components/PhotoUploader";
import { SafePetImage } from "@/components/SafePetImage";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { MobilePetDetail } from "@/components/mobile/MobilePetDetail";
import type { PetMatchResult } from "@/lib/ai/types";
import { getFoundPetItem, listFoundPetItems, matchPet } from "@/lib/api";
import { addFoundPetClaim, makeId, type ClaimRequest, type FoundPet } from "@/lib/local-store";
import { cn } from "@/lib/utils";

const placeholder = "/pet-images/cat-orange.jpg";

export default function FoundPetDetailPage({ id }: { id?: string }) {
  const [pet, setPet] = useState<FoundPet | null>(null);
  const [allPets, setAllPets] = useState<FoundPet[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const activeId = id ?? getFoundIdFromLocation();
    Promise.all([getFoundPetItem(activeId), listFoundPetItems()])
      .then(([detail, items]) => {
        setPet(detail);
        setAllPets(items);
      })
      .catch(() => {
        setPet(null);
        setAllPets([]);
      })
      .finally(() => setLoaded(true));
  }, [id]);

  const similar = useMemo(() => {
    if (!pet) return [];
    return allPets.filter((item) => item.id !== pet.id && (item.type === pet.type || item.color === pet.color)).slice(0, 2);
  }, [allPets, pet]);

  if (loaded && !pet) {
    return (
      <>
        <SiteHeader />
        <main className="container-page py-14">
          <EmptyState title="没有找到这条待领养宠物信息" description="这条信息可能已下架，或还没有同步到数据库。" action={<Link href="/found"><Button>返回待领养列表</Button></Link>} />
        </main>
        <SiteFooter />
      </>
    );
  }
  if (!pet) return null;

  return (
    <>
      <MobilePetDetail id={pet.id} />
      <div className="hidden md:block">
        <SiteHeader />
        <main className="bg-[#fff8f1] py-6">
          <div className="mx-auto w-[min(1280px,calc(100vw-48px))]">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#756a60]"><Home className="h-4 w-4" /><Link href="/found">待领养宠物</Link><span>/</span><span>宠物详情</span></div>
            <div className="grid grid-cols-[420px_1fr_340px] gap-6 max-xl:grid-cols-[1fr_1fr] max-lg:grid-cols-1">
              <FoundPetImageGallery pet={pet} />
              <FoundPetDetailCard pet={pet} />
              <FoundPetClaimForm pet={pet} />
            </div>
            <div className="mt-6 grid grid-cols-[1fr_340px] gap-6 max-lg:grid-cols-1">
              <div className="space-y-6">
                <FoundPetMapPanel pet={pet} />
                <Card className="p-5"><h2 className="mb-3 flex items-center gap-2 text-xl font-black"><Info className="h-5 w-5 text-primary" />补充说明</h2><p className="leading-8 text-[#4f463e]">{pet.description || "发布者暂未填写更多说明。"}</p></Card>
                <ClaimNoticeCard />
              </div>
              <div className="space-y-6">
                <FoundPetAIMatchPanel pet={pet} />
                <SimilarFoundPets pets={similar} />
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}

function FoundPetImageGallery({ pet }: { pet: FoundPet }) {
  const images = pet.images.length ? pet.images : [placeholder];
  const [mainImage, setMainImage] = useState(images[0]);
  useEffect(() => setMainImage(images[0]), [images, pet.id]);
  return (
    <Card className="p-4">
      <SafePetImage src={mainImage} alt={pet.breed || pet.type} className="h-[330px] w-full rounded-2xl" />
      <div className="mt-4 grid grid-cols-3 gap-3">{images.slice(0, 5).map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setMainImage(image)} className={cn("overflow-hidden rounded-xl border-2", mainImage === image ? "border-primary" : "border-transparent")}><SafePetImage src={image} alt={`${pet.breed || pet.type} ${index + 1}`} className="h-24 w-full rounded-lg" /></button>)}</div>
    </Card>
  );
}

function FoundPetDetailCard({ pet }: { pet: FoundPet }) {
  const [contactOpen, setContactOpen] = useState(false);
  const share = async () => {
    await navigator.clipboard?.writeText(window.location.href);
    toast.success("链接已复制，可以分享给朋友");
  };
  return (
    <>
      <Card className="p-7">
        <Badge className="border-primary/20 bg-primary text-white">待领养</Badge>
        <h1 className="mt-4 text-4xl font-black">{pet.breed || pet.type}</h1>
        <p className="mt-2 text-xl text-[#403831]">{pet.type} / {pet.color} / {pet.gender}</p>
        <div className="mt-6 space-y-4">
          <InfoRow icon={<MapPin />} label="发现地点" value={pet.foundLocation} />
          <InfoRow icon={<Clock />} label="发现时间" value={pet.foundTime} />
          <InfoRow icon={<PawPrint />} label="明显特征" value={pet.traits} />
          <InfoRow icon={<ShieldCheck />} label="当前状态" value={pet.status === "waiting" ? "已临时安置，等待主人认领" : "已团聚"} />
          <InfoRow icon={<UserRound />} label="联系人" value={pet.contactName} />
          <InfoRow icon={<Phone />} label="联系方式" value={pet.contactPhone} />
        </div>
        <div className="mt-7 grid grid-cols-2 gap-4"><Button variant="outline" onClick={() => setContactOpen(true)}><Phone className="h-5 w-5" />联系对方</Button><Button variant="secondary" onClick={share}><Share2 className="h-5 w-5" />分享给朋友</Button></div>
      </Card>
      <FoundPetContactDialog pet={pet} open={contactOpen} onOpenChange={setContactOpen} />
    </>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactElement; label: string; value: string }) {
  return <div className="grid grid-cols-[130px_1fr] gap-4 text-sm"><span className="flex items-center gap-2 font-semibold text-[#5b5148] [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-primary">{icon}{label}</span><span className="font-semibold text-[#252525]">{value || "未说明"}</span></div>;
}

function FoundPetContactDialog({ pet, open, onOpenChange }: { pet: FoundPet; open: boolean; onOpenChange: (open: boolean) => void }) {
  const copy = async () => {
    await navigator.clipboard?.writeText(pet.contactPhone);
    toast.success("联系方式已复制");
  };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>联系发布者</DialogTitle><DialogDescription>请先核对宠物特征，再与发布者沟通认领。</DialogDescription></DialogHeader><div className="space-y-4"><div className="rounded-2xl bg-orange-50 p-4"><p className="text-sm text-[#756a60]">联系人</p><p className="mt-1 text-2xl font-black">{pet.contactName}</p></div><div className="rounded-2xl bg-orange-50 p-4"><p className="text-sm text-[#756a60]">联系方式</p><p className="mt-1 text-2xl font-black">{pet.contactPhone}</p></div><Button className="w-full" onClick={copy}><Copy className="h-4 w-4" />复制联系方式</Button></div></DialogContent></Dialog>;
}

function FoundPetClaimForm({ pet }: { pet: FoundPet }) {
  const [proofImages, setProofImages] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", contact: "", proofDescription: "", message: "" });
  const update = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return toast.error("请填写你的称呼");
    if (!form.contact.trim()) return toast.error("请填写联系方式");
    if (!form.proofDescription.trim()) return toast.error("请填写宠物特征说明");
    const claim: ClaimRequest = { id: makeId("claim"), foundPetId: pet.id, name: form.name.trim(), contact: form.contact.trim(), proofDescription: form.proofDescription.trim(), proofImages, message: form.message.trim(), createdAt: new Date().toISOString() };
    addFoundPetClaim(pet.id, claim);
    toast.success("认领信息已提交，发布者会尽快与你联系。");
    setForm({ name: "", contact: "", proofDescription: "", message: "" });
    setProofImages([]);
  };
  return (
    <Card className="p-5">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><UserRound className="h-5 w-5 text-primary" />联系发布者</h2>
      <form onSubmit={submit} className="space-y-4">
        <Field label="你的称呼 *"><Input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="请输入你的称呼" /></Field>
        <Field label="联系方式 *"><Input value={form.contact} onChange={(event) => update("contact", event.target.value)} placeholder="请输入手机号 / 微信号" /></Field>
        <Field label="宠物特征说明 *"><Textarea value={form.proofDescription} onChange={(event) => update("proofDescription", event.target.value)} placeholder="请描述宠物的特征，便于确认" /></Field>
        <Field label="上传证明照片"><PhotoUploader images={proofImages} onChange={setProofImages} compact /></Field>
        <Field label="补充说明"><Textarea value={form.message} onChange={(event) => update("message", event.target.value)} placeholder="补充你的认领情况" /></Field>
        <Button type="submit" className="w-full">提交认领信息</Button>
      </form>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}

function FoundPetMapPanel({ pet }: { pet: FoundPet }) {
  const point = pet.coordinates ?? { x: 52, y: 52, label: pet.foundLocation };
  return <Card className="p-4"><h2 className="mb-4 flex items-center gap-2 text-xl font-black"><MapPin className="h-5 w-5 text-primary" fill="currentColor" />发现位置</h2><div className="map-grid relative h-[170px] overflow-hidden rounded-2xl border border-[#d8e5dc] bg-[#dff2e9]"><div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(75,168,229,.35),transparent_21rem),radial-gradient(circle_at_58%_55%,rgba(255,106,0,.13),transparent_14rem)]" /><div className="absolute z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_22px_rgba(255,106,0,.28)] ring-[14px] ring-primary/15" style={{ left: `${point.x}%`, top: `${point.y}%` }}><MapPin className="h-7 w-7" fill="currentColor" /></div><div className="absolute left-[34%] top-[24%] z-20 rounded-xl bg-white px-4 py-3 shadow-card"><p className="font-black">{point.label}</p><p className="mt-1 text-xs text-[#756a60]">{pet.foundLocation}</p></div></div></Card>;
}

function ClaimNoticeCard() {
  return <Card className="p-5"><h2 className="mb-3 flex items-center gap-2 text-xl font-black"><ShieldCheck className="h-5 w-5 text-primary" />认领说明</h2><ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[#4f463e]"><li>请提供宠物近期照片或明显特征信息进行核对。</li><li>请详细描述宠物的习惯、喜好或特殊标记。</li><li>平台会优先保护宠物安全，请理解并配合确认流程。</li><li>不要公开完整家庭住址，可先使用公共地点交接。</li></ul></Card>;
}

function FoundPetAIMatchPanel({ pet }: { pet: FoundPet }) {
  const [matches, setMatches] = useState<PetMatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const runMatch = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await matchPet(pet.id);
      setMatches(result.matches ?? []);
      if (result.matches?.length) toast.success(`AI 已找到 ${result.matches.length} 条相似宠物信息`);
      else toast.message("暂未找到相似宠物，请稍后再试或扩大搜索范围。");
    } catch (matchError) {
      const message = matchError instanceof Error ? matchError.message : "AI 匹配失败，请稍后再试。";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  return <Card className="p-5"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-xl font-black"><Sparkles className="h-5 w-5 text-primary" />AI匹配相似宠物</h2><Button type="button" size="sm" onClick={runMatch} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{loading ? "匹配中" : "开始匹配"}</Button></div>{error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</p>}{!error && !matches.length && <p className="rounded-xl bg-orange-50 p-4 text-sm text-[#756a60]">点击后会从走失宠物中匹配相似信息。</p>}<div className="space-y-4">{matches.map((match) => <div key={match.postId} className="rounded-2xl border border-orange-100 p-3"><div className="flex items-center justify-between"><b>{match.pet.name || match.pet.breed || match.pet.type}</b><span className="rounded-full bg-primary px-2 py-1 text-xs font-black text-white">{match.score}%</span></div><p className="mt-2 text-sm text-[#756a60]">{match.reasons.slice(0, 2).join("、")}</p><a href={match.pet.kind === "lost" ? `/pet-detail/?id=${encodeURIComponent(match.pet.id)}` : `/found-detail/?id=${encodeURIComponent(match.pet.id)}`}><Button size="sm" variant="outline" className="mt-2">查看详情</Button></a></div>)}</div></Card>;
}

function SimilarFoundPets({ pets }: { pets: FoundPet[] }) {
  return <Card className="p-5"><h2 className="mb-4 flex items-center gap-2 text-xl font-black"><PawPrint className="h-5 w-5 text-primary" fill="currentColor" />相似待领养宠物</h2><div className="space-y-4">{pets.length ? pets.map((pet) => <div key={pet.id} className="grid grid-cols-[84px_1fr] gap-3 rounded-2xl border border-[#eadfd3] p-3"><SafePetImage src={pet.images[0] || placeholder} alt={pet.breed || pet.type} className="h-20 rounded-xl" /><div className="min-w-0"><h3 className="truncate font-black">{pet.breed || pet.type}</h3><p className="mt-1 truncate text-xs text-[#756a60]">{pet.foundLocation}</p><a href={`/found-detail/?id=${encodeURIComponent(pet.id)}`} className="mt-2 inline-block"><Button size="sm" variant="outline">查看详情</Button></a></div></div>) : <p className="rounded-xl bg-orange-50 p-4 text-sm text-[#756a60]">暂无相似待领养宠物。</p>}</div></Card>;
}

function getFoundIdFromLocation() {
  if (typeof window === "undefined") return "";
  const searchId = new URLSearchParams(window.location.search).get("id");
  if (searchId) return searchId;
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts[0] === "found" && parts[1] ? parts[1] : "";
}

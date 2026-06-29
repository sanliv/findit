"use client";

import Link from "next/link";
import { Camera, Clock, Copy, Info, MapPin, PawPrint, Phone, PlusCircle, RotateCcw, Search, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SafePetImage } from "@/components/SafePetImage";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getFoundPets } from "@/lib/api";
import type { FoundPet as FoundPetRow } from "@/lib/types";

const petTypes = ["全部", "猫", "狗", "其他"];

export default function FoundPage() {
  const [pets, setPets] = useState<FoundPetRow[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("全部");
  const [contactPet, setContactPet] = useState<FoundPetRow | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFoundPets()
      .then((rows) => {
        setPets(rows);
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "接口连接失败"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const keyword = query.trim();
    return pets.filter((pet) => {
      const matchType = type === "全部" || pet.species === type;
      const matchQuery = !keyword || [pet.found_location, pet.features, pet.breed, pet.color].join(" ").includes(keyword);
      return matchType && matchQuery;
    });
  }, [pets, query, type]);

  return (
    <>
      <SiteHeader />
      <main className="paw-bg relative py-10">
        <div className="container-page">
          <div className="mb-8 flex items-end justify-between gap-8">
            <div>
              <h1 className="text-5xl font-black">拾宠信息</h1>
              <p className="mt-3 text-lg text-[#6d6258]">这里展示用户真实发布的捡到宠物信息。</p>
            </div>
            <Link href="/found/post"><Button size="lg"><PlusCircle className="h-5 w-5" />发布拾宠信息</Button></Link>
          </div>

          <div className="grid grid-cols-[1fr_320px] gap-8 max-lg:grid-cols-1">
            <section>
              <Card className="mb-5 grid grid-cols-[1fr_180px_120px] gap-4 p-5 max-md:grid-cols-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9a8e82]" />
                  <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索地点 / 特征 / 品种" className="h-12 pl-12" />
                </div>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>{petTypes.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                </Select>
                <Button variant="secondary" className="h-12" onClick={() => { setQuery(""); setType("全部"); }}><RotateCcw className="h-4 w-4" />重置</Button>
              </Card>

              {loading && <Card className="p-10 text-center text-[#6d6258]">正在读取真实数据...</Card>}
              {!loading && error && <Card className="p-10 text-center text-red-600">接口连接失败：{error}</Card>}
              {!loading && !error && filtered.length === 0 && <Card className="p-12 text-center text-2xl font-black">暂无拾宠信息</Card>}

              <div className="grid grid-cols-2 gap-5 max-xl:grid-cols-1">
                {filtered.map((pet) => <FoundPetCard key={pet.id} pet={pet} onContact={() => setContactPet(pet)} />)}
              </div>
            </section>

            <aside>
              <Card className="bg-[#fff8ed] p-6">
                <h2 className="mb-5 flex items-center gap-2 text-2xl font-black"><Info className="h-7 w-7 text-primary" />发布提示</h2>
                {[
                  { icon: Camera, title: "照片要清晰", desc: "正面、全身和特殊标记各一张更容易确认。" },
                  { icon: MapPin, title: "地点要准确", desc: "尽量写到小区门口、商场入口、路口等可定位地标。" },
                  { icon: ShieldCheck, title: "先核验主人", desc: "认领时建议核对旧照片、名字和生活细节。" }
                ].map((item) => (
                  <div key={item.title} className="mb-6 flex gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-orange-200 bg-white text-primary"><item.icon className="h-6 w-6" /></span>
                    <div>
                      <h3 className="font-black">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#6d6258]">{item.desc}</p>
                    </div>
                  </div>
                ))}
                <p className="border-t border-orange-100 pt-5 text-sm font-bold text-[#b76b22]">让更多真实拾宠信息尽快回到主人身边。</p>
              </Card>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
      <ContactDialog pet={contactPet} onOpenChange={(open) => !open && setContactPet(null)} />
    </>
  );
}

function FoundPetCard({ pet, onContact }: { pet: FoundPetRow; onContact: () => void }) {
  return (
    <Card className="grid grid-cols-[190px_1fr] gap-5 p-3 max-sm:grid-cols-1">
      <div className="relative">
        <SafePetImage src={pet.image_url || ""} alt={pet.breed || pet.species || "拾宠照片"} className="h-[250px] rounded-xl" />
        <span className="absolute left-3 top-3 rounded-lg bg-primary px-3 py-1 text-xs font-bold text-white">已拾到</span>
      </div>
      <div className="flex min-w-0 flex-col">
        <h3 className="text-2xl font-black">{pet.breed || pet.species || "未知宠物"}</h3>
        <p className="mt-1 text-sm text-[#5c534b]">{pet.species || "未知"} / {pet.color || "未说明"} / {pet.gender || "未知"}</p>
        <div className="mt-4 space-y-2 text-sm text-[#5c534b]">
          <p className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-primary" />{pet.found_location || "地点待填写"}</p>
          <p className="flex gap-2"><Clock className="h-4 w-4 shrink-0 text-primary" />{pet.found_time || "时间待填写"}</p>
          <p className="flex gap-2"><PawPrint className="h-4 w-4 shrink-0 text-primary" fill="currentColor" />{pet.features || "暂无明显特征"}</p>
          <p className="flex gap-2"><UserRound className="h-4 w-4 shrink-0 text-[#777]" />{pet.contact_name || "联系人待填写"}</p>
          <p className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-[#777]" />{pet.contact_phone || pet.contact_wechat || "联系方式待填写"}</p>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
          <Button variant="outline" onClick={onContact}>联系对方</Button>
          <a href={`/found-detail/?id=${encodeURIComponent(pet.id)}`}><Button variant="secondary" className="w-full">查看详情</Button></a>
        </div>
      </div>
    </Card>
  );
}

function ContactDialog({ pet, onOpenChange }: { pet: FoundPetRow | null; onOpenChange: (open: boolean) => void }) {
  const copy = async () => {
    if (!pet) return;
    await navigator.clipboard?.writeText(pet.contact_phone || pet.contact_wechat || "");
    toast.success("联系方式已复制");
  };
  return (
    <Dialog open={!!pet} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>联系发布者</DialogTitle>
          <DialogDescription>请先核对宠物信息，再与发布者沟通认领。</DialogDescription>
        </DialogHeader>
        {pet && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-orange-50 p-4"><p className="text-sm text-[#756a60]">联系人</p><p className="mt-1 text-xl font-black">{pet.contact_name || "待填写"}</p></div>
            <div className="rounded-2xl bg-orange-50 p-4"><p className="text-sm text-[#756a60]">联系方式</p><p className="mt-1 text-xl font-black">{pet.contact_phone || pet.contact_wechat || "待填写"}</p></div>
            <Button className="w-full" onClick={copy}><Copy className="h-4 w-4" />复制联系方式</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

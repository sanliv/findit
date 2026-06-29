"use client";

import Link from "next/link";
import { Clock, MapPin, PawPrint, PlusCircle, RotateCcw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SafePetImage } from "@/components/SafePetImage";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getLostPets } from "@/lib/api";
import type { LostPet as LostPetRow } from "@/lib/types";

const petTypes = ["全部", "猫", "狗", "其他"];

export default function LostPetsPage() {
  const [pets, setPets] = useState<LostPetRow[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("全部");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLostPets()
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
      const matchQuery = !keyword || [
        pet.name,
        pet.species,
        pet.breed,
        pet.color,
        pet.features,
        pet.lost_location
      ].join(" ").includes(keyword);
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
              <h1 className="text-5xl font-black">走失宠物信息</h1>
              <p className="mt-3 text-lg text-[#6d6258]">这里展示 D1 数据库中的真实寻宠发布。</p>
            </div>
            <Link href="/post"><Button size="lg"><PlusCircle className="h-5 w-5" />发布走失宠物</Button></Link>
          </div>

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
          {!loading && !error && filtered.length === 0 && (
            <Card className="p-12 text-center">
              <h2 className="text-2xl font-black">暂无走失宠物信息，快去发布第一条吧</h2>
              <Link href="/post" className="mt-5 inline-block"><Button>发布走失宠物</Button></Link>
            </Card>
          )}

          <div className="grid grid-cols-3 gap-5 max-xl:grid-cols-2 max-md:grid-cols-1">
            {filtered.map((pet) => <LostPetCard key={pet.id} pet={pet} />)}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function LostPetCard({ pet }: { pet: LostPetRow }) {
  return (
    <Card className="overflow-hidden">
      <SafePetImage src={pet.image_url || ""} alt={pet.name || pet.breed || "走失宠物"} className="h-64 w-full" />
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="truncate text-2xl font-black">{pet.name || pet.breed || pet.species || "未命名宠物"}</h3>
          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-primary">{pet.status || "searching"}</span>
        </div>
        <p className="text-sm text-[#5c534b]">{pet.species || "未知"} / {pet.breed || "未知品种"} / {pet.color || "未说明颜色"}</p>
        <div className="mt-4 space-y-2 text-sm text-[#5c534b]">
          <p className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-primary" />{pet.lost_location || "地点待填写"}</p>
          <p className="flex gap-2"><Clock className="h-4 w-4 shrink-0 text-primary" />{pet.lost_time || "时间待填写"}</p>
          <p className="flex gap-2"><PawPrint className="h-4 w-4 shrink-0 text-primary" fill="currentColor" />{pet.features || "暂无明显特征"}</p>
        </div>
        <Link href={`/pet-detail/?id=${encodeURIComponent(pet.id)}`} className="mt-5 block">
          <Button variant="secondary" className="w-full">查看详情</Button>
        </Link>
      </div>
    </Card>
  );
}

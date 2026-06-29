"use client";

import { CalendarDays, Flag, LayoutList, Map, MapPin, PawPrint, RotateCcw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/EmptyState";
import { MapPanel } from "@/components/MapPanel";
import { PetCard } from "@/components/PetCard";
import { SiteHeader } from "@/components/SiteHeader";
import { cn } from "@/lib/utils";
import { listPets } from "@/lib/api";
import type { LostPet, PetStatus, PetType } from "@/lib/local-store";

const regionData = {
  "广东省": { "深圳市": ["福田区", "南山区", "罗湖区", "宝安区", "龙岗区"], "广州市": ["天河区", "越秀区", "海珠区", "番禺区"] },
  "上海市": { "上海市": ["浦东新区", "静安区", "徐汇区", "黄浦区", "闵行区"] },
  "北京市": { "北京市": ["朝阳区", "海淀区", "东城区", "西城区", "丰台区"] },
  "浙江省": { "杭州市": ["西湖区", "上城区", "滨江区", "余杭区"], "宁波市": ["海曙区", "鄞州区", "江北区"] }
} as const;

type Province = keyof typeof regionData;
type ViewMode = "list" | "map";
type DistanceFilter = "1km" | "3km" | "5km" | "10km" | "全部";
type TypeFilter = PetType | "全部";
type StatusFilter = PetStatus | "全部";
type TimeFilter = "今天" | "近3天" | "近7天" | "近30天" | "全部";

const statusOptions: Array<{ label: string; value: StatusFilter }> = [
  { label: "全部", value: "全部" },
  { label: "寻找中", value: "searching" },
  { label: "有线索", value: "clue" },
  { label: "紧急", value: "urgent" }
];

export default function NearbyPage() {
  const [pets, setPets] = useState<LostPet[]>([]);
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState<Province | "">("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [distance, setDistance] = useState<DistanceFilter>("全部");
  const [type, setType] = useState<TypeFilter>("全部");
  const [status, setStatus] = useState<StatusFilter>("全部");
  const [time, setTime] = useState<TimeFilter>("全部");
  const [selectedId, setSelectedId] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [nearbyOnly, setNearbyOnly] = useState(false);

  useEffect(() => {
    listPets().then((items) => {
      const lost = items.filter((item) => item.kind === "lost").map((item) => item.pet as LostPet).filter((pet) => pet.status !== "found");
      setPets(lost);
      setSelectedId(lost[0]?.id || "");
    });
  }, []);

  const cities = province ? Object.keys(regionData[province]) : [];
  const districts = province && city ? [...regionData[province][city as keyof typeof regionData[typeof province]]] : [];

  const filtered = useMemo(() => {
    let list = [...pets];
    const keyword = query.trim();
    if (keyword) list = list.filter((pet) => [pet.name, pet.location, pet.traits, pet.breed].join("").includes(keyword));
    [province, city, district].filter(Boolean).forEach((token) => { list = list.filter((pet) => pet.location.includes(token)); });
    if (type !== "全部") list = list.filter((pet) => pet.type === type);
    if (status !== "全部") list = list.filter((pet) => pet.status === status);
    if (time !== "全部") list = list.filter((pet) => isWithinTime(pet.lostTime, time));
    if (distance !== "全部") {
      const count = distance === "1km" ? 2 : distance === "3km" ? 4 : distance === "5km" ? 6 : 10;
      list = list.slice(0, count);
    }
    return list;
  }, [pets, query, province, city, district, type, status, time, distance]);

  useEffect(() => {
    if (!filtered.length) setSelectedId("");
    else if (!filtered.some((pet) => pet.id === selectedId)) setSelectedId(filtered[0].id);
  }, [filtered, selectedId]);

  const selectedPet = filtered.find((pet) => pet.id === selectedId) ?? null;

  const reset = () => {
    setQuery("");
    setProvince("");
    setCity("");
    setDistrict("");
    setDistance("全部");
    setType("全部");
    setStatus("全部");
    setTime("全部");
    setNearbyOnly(false);
  };

  return (
    <>
      <SiteHeader />
      <main className="paw-bg relative py-8">
        <div className="container-page">
          <div className="mb-6 flex items-end justify-between gap-4 max-md:flex-col max-md:items-start">
            <div>
              <h1 className="text-5xl font-black max-md:text-4xl">附近走失宠物</h1>
              <p className="mt-3 text-lg text-[#6d6258]">查看你附近正在寻找的宠物，并快速提供线索。</p>
            </div>
            <ViewToggle value={viewMode} onChange={setViewMode} />
          </div>

          <Card className="mb-6 rounded-[22px] p-5">
            <div className="grid grid-cols-[1fr_180px_180px_180px] gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9a8e82]" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索地点 / 名字 / 特征" className="h-12 pl-12 text-base" />
              </div>
              <PlainSelect value={province || "全部"} onValueChange={(value) => { setProvince(value === "全部" ? "" : value as Province); setCity(""); setDistrict(""); }} items={["全部", ...Object.keys(regionData)]} placeholder="省份" />
              <PlainSelect value={city || "全部"} onValueChange={(value) => { setCity(value === "全部" ? "" : value); setDistrict(""); }} items={["全部", ...cities]} placeholder="城市" disabled={!province} />
              <PlainSelect value={district || "全部"} onValueChange={(value) => setDistrict(value === "全部" ? "" : value)} items={["全部", ...districts]} placeholder="区县" disabled={!city} />
            </div>
            <div className="mt-4 grid grid-cols-[1fr_1fr_1fr_1fr_120px] gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
              <FilterSelect icon={<MapPin className="h-5 w-5" />} label="距离" value={distance} onValueChange={(value) => setDistance(value as DistanceFilter)} items={["1km", "3km", "5km", "10km", "全部"]} />
              <FilterSelect icon={<PawPrint className="h-5 w-5" />} label="类型" value={type} onValueChange={(value) => setType(value as TypeFilter)} items={["全部", "猫", "狗", "其他"]} />
              <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
                <SelectTrigger className="h-12 text-base"><span className="flex items-center gap-3"><Flag className="h-5 w-5" /><span className="text-[#5f554d]">状态</span><SelectValue /></span></SelectTrigger>
                <SelectContent>{statusOptions.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
              </Select>
              <FilterSelect icon={<CalendarDays className="h-5 w-5" />} label="时间" value={time} onValueChange={(value) => setTime(value as TimeFilter)} items={["今天", "近3天", "近7天", "近30天", "全部"]} />
              <Button variant="secondary" className="h-12 text-base" onClick={reset}><RotateCcw className="h-5 w-5" />重置</Button>
            </div>
          </Card>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">共找到 <span className="text-primary">{filtered.length}</span> 条寻宠信息</h2>
            {selectedPet && <p className="text-sm text-[#756a60]">当前选中：<span className="font-bold text-primary">{selectedPet.name}</span></p>}
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="没有找到符合条件的宠物" description="调整筛选条件或点击重置试试。" action={<Button onClick={reset}>重置筛选</Button>} />
          ) : viewMode === "list" ? (
            <section className="grid grid-cols-3 gap-5 max-2xl:grid-cols-2 max-lg:grid-cols-1">
              {filtered.map((pet) => <PetCard key={pet.id} pet={pet} selected={pet.id === selectedId} onSelect={() => setSelectedId(pet.id)} />)}
            </section>
          ) : (
            <Card className="grid grid-cols-[520px_1fr] gap-0 overflow-hidden rounded-[22px] max-lg:grid-cols-1">
              <section className="border-r p-5 max-lg:border-r-0 max-lg:border-b">
                <div className="space-y-4">{filtered.map((pet) => <PetCard key={pet.id} pet={pet} compact selected={pet.id === selectedId} onSelect={() => setSelectedId(pet.id)} />)}</div>
              </section>
              <MapPanel pets={filtered} selectedId={selectedId} onSelect={(pet) => setSelectedId(pet.id)} nearbyOnly={nearbyOnly} onNearbyOnlyChange={setNearbyOnly} />
            </Card>
          )}
        </div>
      </main>
    </>
  );
}

function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (value: ViewMode) => void }) {
  return (
    <div className="flex rounded-2xl border border-[#eadfd3] bg-white p-1 shadow-card">
      <button type="button" onClick={() => onChange("list")} className={cn("flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold transition", value === "list" ? "bg-orange-50 text-primary" : "hover:bg-orange-50")}><LayoutList className="h-4 w-4" />列表</button>
      <button type="button" onClick={() => onChange("map")} className={cn("flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold transition", value === "map" ? "bg-orange-50 text-primary" : "hover:bg-orange-50")}><Map className="h-4 w-4" />地图</button>
    </div>
  );
}

function PlainSelect({ value, onValueChange, items, placeholder, disabled }: { value: string; onValueChange: (value: string) => void; items: string[]; placeholder: string; disabled?: boolean }) {
  return <Select value={value} onValueChange={onValueChange} disabled={disabled}><SelectTrigger className="h-12 text-base"><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent>{items.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>;
}

function FilterSelect({ icon, label, value, onValueChange, items }: { icon: React.ReactNode; label: string; value: string; onValueChange: (value: string) => void; items: string[] }) {
  return <Select value={value} onValueChange={onValueChange}><SelectTrigger className="h-12 text-base"><span className="flex items-center gap-3">{icon}<span className="text-[#5f554d]">{label}</span><SelectValue /></span></SelectTrigger><SelectContent>{items.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>;
}

function isWithinTime(lostTime: string, filter: TimeFilter) {
  const match = lostTime.match(/\d{4}-\d{2}-\d{2}/);
  if (!match) return filter === "全部";
  const date = new Date(`${match[0]}T00:00:00`);
  const now = new Date("2026-06-24T00:00:00");
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (filter === "今天") return diffDays === 0;
  if (filter === "近3天") return diffDays >= 0 && diffDays <= 3;
  if (filter === "近7天") return diffDays >= 0 && diffDays <= 7;
  if (filter === "近30天") return diffDays >= 0 && diffDays <= 30;
  return true;
}

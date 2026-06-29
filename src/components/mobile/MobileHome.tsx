"use client";

import { Bell, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BottomNav } from "@/components/mobile/BottomNav";
import { FilterChips } from "@/components/mobile/FilterChips";
import { LocationSelector } from "@/components/mobile/LocationSelector";
import { MobilePetCard } from "@/components/mobile/PetCard";
import { PetMap } from "@/components/mobile/PetMap";
import { SearchBar } from "@/components/mobile/SearchBar";
import { EmptyState } from "@/components/mobile/States";
import { ViewToggle } from "@/components/mobile/ViewToggle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getAllMobilePets, getAllMobilePetsRemote, getFavorites, toggleFavorite } from "@/lib/mobile-api";
import { cn } from "@/lib/utils";
import type { FoundPet, LostPet } from "@/lib/local-store";

type MobileItem = { kind: "lost"; pet: LostPet } | { kind: "found"; pet: FoundPet };

export function MobileHome() {
  const [items, setItems] = useState<MobileItem[]>([]);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"lost" | "found">("lost");
  const [view, setView] = useState<"list" | "map">("list");
  const [category, setCategory] = useState("全部");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [contact, setContact] = useState<MobileItem | null>(null);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    const next = getAllMobilePets();
    setItems(next);
    setFavorites(getFavorites());
    setSelectedId(next[0]?.pet.id ?? "");
    getAllMobilePetsRemote().then((remote) => {
      setItems(remote);
      setSelectedId((prev) => prev || remote[0]?.pet.id || "");
    }).catch(() => undefined);
  }, []);

  const filtered = useMemo(() => {
    const keyword = query.trim();
    return items.filter((item) => {
      if (item.kind !== mode) return false;
      const typeMatch =
        category === "全部" ||
        (category === "狗狗" && item.pet.type === "狗") ||
        (category === "猫咪" && item.pet.type === "猫") ||
        (category === "其他" && item.pet.type === "其他");
      const text = item.kind === "lost"
        ? [item.pet.name, item.pet.type, item.pet.breed, item.pet.color, item.pet.location, item.pet.traits].join(" ")
        : [item.pet.type, item.pet.breed, item.pet.color, item.pet.foundLocation, item.pet.traits].join(" ");
      return typeMatch && (!keyword || text.includes(keyword));
    });
  }, [category, items, mode, query]);

  const toggle = (id: string) => {
    const next = toggleFavorite(id);
    setFavorites(next);
    toast.success(next.includes(id) ? "已收藏" : "已取消收藏");
  };

  return (
    <div className="min-h-screen bg-[#fff8f1] pb-[calc(88px+env(safe-area-inset-bottom))] md:hidden">
      <main className="mx-auto max-w-md px-4 pb-4 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <button type="button" className="flex items-center gap-1 text-2xl font-black text-[#252525]">
            上海市
            <ChevronDown className="h-4 w-4" />
          </button>
          <button type="button" className="relative rounded-full p-2 text-[#252525]" aria-label="通知">
            <Bell className="h-7 w-7" />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[var(--color-lost)]" />
          </button>
        </div>

        <SearchBar value={query} onChange={setQuery} />

        <div className="mt-4 grid h-14 grid-cols-2 rounded-2xl bg-white p-1 shadow-card">
          {[
            { key: "lost" as const, label: "寻宠" },
            { key: "found" as const, label: "待领养" }
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setMode(item.key)}
              className={cn("rounded-xl text-base font-black text-[#252525]", mode === item.key && "bg-[var(--color-primary)] text-white shadow-sm")}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-3"><LocationSelector /></div>
        <div className="mt-3 rounded-3xl bg-white p-3 shadow-card">
          <div className="mb-3 flex justify-end"><ViewToggle value={view} onChange={setView} /></div>
          <FilterChips value={category} onChange={setCategory} />
        </div>

        {view === "map" ? (
          <div className="mt-4">
            <PetMap items={filtered} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {filtered.length ? filtered.map((item) => (
              <MobilePetCard
                key={item.pet.id}
                item={item}
                favorite={favorites.includes(item.pet.id)}
                onFavorite={() => toggle(item.pet.id)}
                onContact={() => setContact(item)}
              />
            )) : (
              <div className="col-span-2">
                <EmptyState title="没有找到相关宠物" description="试试切换寻宠/待领养，或调整搜索关键词。" />
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav />

      <Dialog open={!!contact} onOpenChange={(open) => !open && setContact(null)}>
        <DialogContent className="max-w-[calc(100vw-32px)] rounded-3xl">
          <DialogHeader><DialogTitle>联系发布者</DialogTitle></DialogHeader>
          {contact && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[var(--color-primary-soft)] p-4">
                <p className="text-sm text-[#666]">联系人</p>
                <p className="mt-1 text-xl font-black">{contact.pet.contactName}</p>
              </div>
              <div className="rounded-2xl bg-[var(--color-primary-soft)] p-4">
                <p className="text-sm text-[#666]">联系方式</p>
                <p className="mt-1 text-xl font-black">{contact.pet.contactPhone}</p>
              </div>
              <Button
                className="h-12 w-full rounded-2xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
                onClick={() => {
                  navigator.clipboard?.writeText(contact.pet.contactPhone);
                  toast.success("联系方式已复制");
                }}
              >
                复制联系方式
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

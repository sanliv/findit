"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Heart, MapPin, Megaphone, MessageCircle, NotebookPen, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FeaturedPetCard } from "@/components/FeaturedPetCard";
import { PetCard } from "@/components/PetCard";
import { SectionTitle } from "@/components/SectionTitle";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SuccessStoryCard } from "@/components/SuccessStoryCard";
import { MobileHome } from "@/components/mobile/MobileHome";
import { listPets, type PetItem } from "@/lib/api";
import type { LostPet } from "@/lib/local-store";

export default function HomePage() {
  const [items, setItems] = useState<PetItem[]>([]);

  useEffect(() => {
    listPets().then(setItems).catch(() => setItems([]));
  }, []);

  const lostPets = useMemo(() => items.filter((item) => item.kind === "lost").map((item) => item.pet as LostPet), [items]);
  const searching = useMemo(() => lostPets.filter((pet) => pet.status !== "found"), [lostPets]);
  const found = useMemo(() => lostPets.filter((pet) => pet.status === "found"), [lostPets]);
  const heroPet = searching[0];

  return (
    <>
      <MobileHome />
      <div className="hidden md:block">
        <SiteHeader />
        <main className="paw-bg relative">
          <section className="border-b border-[#f0e5d8] bg-gradient-to-r from-[#fff8f1] via-[#fffaf6] to-[#fff4e7] py-7">
            <div className="container-page grid grid-cols-[1fr_720px] items-center gap-14">
              <div>
                <h1 className="text-[64px] font-black leading-[1.12] tracking-normal">
                  宠物走失了？<br />
                  我们一起<span className="text-primary">帮它回家</span>。
                </h1>
                <p className="mt-6 max-w-[680px] text-xl leading-9 text-[#514941]">
                  快速发布寻宠信息，展示走失地点、宠物照片和联系方式，让附近的人第一时间看到。
                </p>
                <div className="mt-7 flex gap-6">
                  <Link href="/post"><Button size="lg" className="min-w-52 text-lg"><Send className="h-5 w-5" fill="currentColor" />立即发布寻宠</Button></Link>
                  <Link href="/nearby"><Button size="lg" variant="secondary" className="min-w-52 text-lg"><MapPin className="h-5 w-5" fill="currentColor" />查看附近走失宠物</Button></Link>
                </div>
              </div>
              {heroPet && <FeaturedPetCard pet={heroPet} />}
            </div>
          </section>

          <section className="container-page py-5">
            <SectionTitle title="附近正在寻找" icon={MapPin} action={<Link href="/nearby" className="font-bold text-[#3c332c]">查看更多 &gt;</Link>} />
            <div className="grid grid-cols-3 gap-5 max-xl:grid-cols-2 max-md:grid-cols-1">
              {searching.slice(0, 6).map((pet) => <PetCard key={pet.id} pet={pet} compact />)}
            </div>
          </section>

          <section className="container-page">
            <Card className="grid grid-cols-[220px_1fr_1fr_1fr] items-center gap-5 px-8 py-5">
              <h2 className="text-2xl font-black">如何帮助找回</h2>
              {[
                { n: "1", title: "发布信息", desc: "填写宠物特征、走失地点和时间", icon: NotebookPen },
                { n: "2", title: "附近扩散", desc: "让更多附近的人看到并留意", icon: Megaphone },
                { n: "3", title: "提供线索", desc: "如有看到，请及时联系主人", icon: MessageCircle }
              ].map((step, index) => (
                <div key={step.title} className="flex items-center gap-5 border-l border-[#eadfd3] pl-8">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-2xl font-black text-primary">{step.n}</span>
                  <step.icon className="h-10 w-10 text-primary" />
                  <div>
                    <h3 className="text-lg font-black">{step.title}</h3>
                    <p className="text-sm text-[#6d6258]">{step.desc}</p>
                  </div>
                  {index < 2 && <ArrowRight className="ml-auto h-5 w-5 text-[#9b9188]" />}
                </div>
              ))}
            </Card>
          </section>

          <section className="container-page py-6">
            <SectionTitle title="成功找回" icon={Heart} action={<Link href="/success" className="font-bold text-success">查看更多 &gt;</Link>} />
            <div className="grid grid-cols-3 gap-7">
              {found.slice(0, 3).map((pet) => <SuccessStoryCard key={pet.id} pet={pet} />)}
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { Clock3, HeartHandshake, MessageSquareText, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/SectionTitle";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SuccessStoryCard } from "@/components/SuccessStoryCard";
import { listLostPetItems } from "@/lib/api";
import type { LostPet } from "@/lib/local-store";

export default function SuccessPage() {
  const [pets, setPets] = useState<LostPet[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    listLostPetItems()
      .then(setPets)
      .catch((err) => setError(err instanceof Error ? err.message : "接口连接失败"));
  }, []);

  const foundPets = useMemo(() => pets.filter((pet) => pet.status === "found"), [pets]);

  return (
    <>
      <SiteHeader />
      <main className="paw-bg relative py-10">
        <div className="container-page">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h1 className="text-5xl font-black">成功找回案例</h1>
              <p className="mt-3 text-lg text-[#6d6258]">这里仅展示 D1 中真实标记为已找回的走失宠物。</p>
            </div>
            <Link href="/post"><Button size="lg"><Send className="h-5 w-5" />发布寻宠信息</Button></Link>
          </div>

          <section className="mb-8 grid grid-cols-3 gap-5 max-lg:grid-cols-1">
            {[
              { icon: Send, title: "发布", desc: "上传照片和走失信息" },
              { icon: MessageSquareText, title: "线索", desc: "热心用户提供线索" },
              { icon: HeartHandshake, title: "团圆", desc: "确认信息并找回宠物" }
            ].map((item) => (
              <Card key={item.title} className="flex items-center gap-4 p-6">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-primary"><item.icon className="h-7 w-7" /></span>
                <div>
                  <h2 className="text-xl font-black">{item.title}</h2>
                  <p className="text-sm text-[#6d6258]">{item.desc}</p>
                </div>
              </Card>
            ))}
          </section>

          <SectionTitle title="真实找回记录" icon={Clock3} />
          {error && <Card className="p-10 text-center text-red-600">接口连接失败：{error}</Card>}
          {!error && foundPets.length === 0 && <Card className="p-12 text-center text-2xl font-black">暂无真实找回案例</Card>}
          <div className="grid grid-cols-3 gap-7 max-lg:grid-cols-1">
            {foundPets.map((pet) => <SuccessStoryCard key={pet.id} pet={pet} />)}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

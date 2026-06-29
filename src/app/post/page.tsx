"use client";

import { useMemo, useState } from "react";
import { Check, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PetPreviewCard, PreviewPet } from "@/components/PetPreviewCard";
import { PhotoUploader } from "@/components/PhotoUploader";
import { SiteHeader } from "@/components/SiteHeader";
import { MobilePostPage } from "@/components/mobile/MobilePostPage";
import { analyzePet, createPet } from "@/lib/api";
import type { AIPetInfo, PetType } from "@/lib/local-store";

export default function PostPage() {
  const [images, setImages] = useState<string[]>([]);
  const [aiInfo, setAiInfo] = useState<AIPetInfo | undefined>();
  const [aiLoading, setAiLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "" as PetType | "",
    breed: "",
    color: "",
    gender: "",
    age: "",
    location: "",
    lostTime: "",
    traits: "",
    contactName: "",
    contactPhone: "",
    reward: "",
    description: ""
  });

  const update = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const runAIAnalyze = async () => {
    if (!images[0]) {
      toast.error("请先上传宠物照片");
      return;
    }
    setAiLoading(true);
    try {
      const next = await analyzePet(images[0]);
      setAiInfo(next);
      if (next.petType === "cat") update("type", "猫");
      if (next.petType === "dog") update("type", "狗");
      if (next.breed) update("breed", next.breed);
      if (next.color.length) update("color", next.color.join("、"));
      if (next.genderGuess) update("gender", next.genderGuess.replace("疑似", ""));
      if (next.ageGuess) update("age", next.ageGuess);
      if (next.features.length) update("traits", next.features.join("、"));
      if (next.description) update("description", next.description);
      toast.success("AI 识别完成，已自动填充");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI 识别失败，你仍然可以手动发布");
    } finally {
      setAiLoading(false);
    }
  };

  const preview: PreviewPet = useMemo(() => ({
    name: form.name,
    type: form.type || "",
    breed: form.breed,
    gender: form.gender,
    age: form.age,
    location: form.location,
    lostTime: form.lostTime,
    traits: form.traits,
    collar: true,
    contactName: form.contactName,
    contactPhone: form.contactPhone,
    reward: form.reward,
    image: images[0] ?? ""
  }), [form, images]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const required: Array<[string, string]> = [
      ["宠物名字", form.name],
      ["宠物类型", form.type],
      ["走失地点", form.location],
      ["走失时间", form.lostTime],
      ["联系人", form.contactName],
      ["手机号 / 微信", form.contactPhone]
    ];
    const missing = required.find(([, value]) => !String(value).trim());
    if (missing) {
      toast.error(`请填写${missing[0]}`);
      return;
    }

    setPublishing(true);
    try {
      const result = await createPet("lost", {
        images,
        type: form.type as PetType,
        breed: form.breed,
        gender: form.gender,
        color: form.color,
        time: form.lostTime,
        location: form.location,
        contactName: form.contactName,
        contactPhone: form.contactPhone,
        description: form.description,
        traits: form.traits,
        name: form.name,
        age: form.age,
        reward: form.reward,
        aiInfo
      });
      toast.success("发布成功");
      window.location.href = `/pet-detail/?id=${encodeURIComponent(result.id)}`;
    } catch {
      toast.error("发布失败，请稍后重试");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <>
      <MobilePostPage />
      <div className="hidden md:block">
        <SiteHeader />
        <main className="paw-bg relative py-9">
          <div className="container-page">
            <div className="mb-8">
              <h1 className="text-5xl font-black">发布寻宠信息</h1>
              <p className="mt-3 text-lg text-[#6d6258]">上传照片、AI 识别并发布，PC 和手机端会同步显示。</p>
            </div>
            <div className="grid grid-cols-[1fr_430px] gap-8">
              <form onSubmit={submit}>
                <Card className="space-y-8 p-7">
                  <section>
                    <h2 className="mb-5 flex items-center gap-2 text-2xl font-black"><Step n="1" />上传宠物照片</h2>
                    <PhotoUploader images={images} onChange={setImages} />
                    <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50/70 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="flex items-center gap-2 text-lg font-black"><Sparkles className="h-5 w-5 text-primary" />AI识别宠物信息</h3>
                          <p className="mt-1 text-sm text-[#6d6258]">自动识别宠物类型、疑似品种、颜色和明显特征，结果可手动修改。</p>
                        </div>
                        <Button type="button" variant="outline" onClick={runAIAnalyze} disabled={aiLoading}>
                          {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                          {aiLoading ? "正在识别..." : "AI识别宠物信息"}
                        </Button>
                      </div>
                      {aiInfo && <p className="mt-3 text-sm text-[#5c534b]">识别结果：{aiInfo.breed || "未知品种"}，{aiInfo.color.join("、") || "未知颜色"}，置信度 {aiInfo.confidence}%</p>}
                    </div>
                  </section>

                  <section>
                    <h2 className="mb-5 flex items-center gap-2 text-2xl font-black"><Step n="2" />宠物与走失信息</h2>
                    <div className="grid grid-cols-2 gap-5">
                      <Field label="宠物名字 *"><Input value={form.name} onChange={(e) => update("name", e.target.value)} /></Field>
                      <Field label="宠物类型 *"><TypeButtons value={form.type} onChange={(v) => update("type", v)} /></Field>
                      <Field label="品种"><Input value={form.breed} onChange={(e) => update("breed", e.target.value)} /></Field>
                      <Field label="颜色"><Input value={form.color} onChange={(e) => update("color", e.target.value)} /></Field>
                      <Field label="性别"><Input value={form.gender} onChange={(e) => update("gender", e.target.value)} placeholder="公 / 母 / 未知" /></Field>
                      <Field label="年龄"><Input value={form.age} onChange={(e) => update("age", e.target.value)} /></Field>
                      <Field label="走失地点 *"><Input value={form.location} onChange={(e) => update("location", e.target.value)} /></Field>
                      <Field label="走失时间 *"><Input type="datetime-local" value={form.lostTime.replace(" ", "T")} onChange={(e) => update("lostTime", e.target.value.replace("T", " "))} /></Field>
                    </div>
                    <Field label="明显特征" className="mt-5"><Input value={form.traits} onChange={(e) => update("traits", e.target.value)} /></Field>
                  </section>

                  <section>
                    <h2 className="mb-5 flex items-center gap-2 text-2xl font-black"><Step n="3" />联系方式</h2>
                    <div className="grid grid-cols-3 gap-5">
                      <Field label="联系人 *"><Input value={form.contactName} onChange={(e) => update("contactName", e.target.value)} /></Field>
                      <Field label="手机号 / 微信 *"><Input value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} /></Field>
                      <Field label="悬赏"><Input value={form.reward} onChange={(e) => update("reward", e.target.value)} placeholder="如：500元" /></Field>
                    </div>
                    <Field label="补充说明" className="mt-5"><Textarea value={form.description} onChange={(e) => update("description", e.target.value)} /></Field>
                    <div className="mt-6 flex justify-end">
                      <Button type="submit" className="min-w-60 text-base" disabled={publishing}>{publishing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" fill="currentColor" />}发布寻宠信息</Button>
                    </div>
                  </section>
                </Card>
              </form>
              <aside className="space-y-5">
                <PetPreviewCard pet={preview} />
                <Card className="bg-[#fff8ed] p-5">
                  <h3 className="mb-5 flex items-center gap-2 text-xl font-black">填写建议</h3>
                  {["照片尽量清晰，正面照更容易识别", "地点越准确越好，精确到具体地标", "特征尽量具体，独特细节有助快速识别"].map((item) => <p key={item} className="mb-4 flex gap-3 text-sm"><Check className="h-5 w-5 shrink-0 rounded-full bg-white p-0.5 text-primary" />{item}</p>)}
                </Card>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function Step({ n }: { n: string }) {
  return <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-base text-white">{n}</span>;
}

function TypeButtons({ value, onChange }: { value: string; onChange: (value: PetType) => void }) {
  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-xl border">
      {(["猫", "狗", "其他"] as PetType[]).map((type) => <button type="button" key={type} onClick={() => onChange(type)} className={value === type ? "bg-orange-50 py-3 font-bold text-primary ring-1 ring-primary" : "bg-white py-3 font-semibold"}>{type}</button>)}
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={`relative space-y-2 ${className ?? ""}`}><Label>{label}</Label>{children}</div>;
}

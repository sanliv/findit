"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2, Send, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhotoUploader } from "@/components/PhotoUploader";
import { SiteHeader } from "@/components/SiteHeader";
import { analyzePet, createPet } from "@/lib/api";
import type { AIPetInfo, PetType } from "@/lib/local-store";

export default function FoundPostPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [aiInfo, setAiInfo] = useState<AIPetInfo | undefined>();
  const [aiLoading, setAiLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [form, setForm] = useState({
    type: "猫" as PetType,
    breed: "",
    gender: "未知",
    color: "",
    traits: "",
    foundLocation: "",
    foundTime: new Date().toISOString().slice(0, 16),
    description: "",
    contactName: "",
    contactPhone: ""
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
      if (next.features.length) update("traits", next.features.join("、"));
      if (next.description) update("description", next.description);
      toast.success("AI 识别完成，已自动填充");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI 识别失败，你仍然可以手动发布");
    } finally {
      setAiLoading(false);
    }
  };

  const progressText = useMemo(() => {
    if (!images.length) return "1 / 3";
    if (!form.foundLocation || !form.foundTime) return "2 / 3";
    return "3 / 3";
  }, [images.length, form.foundLocation, form.foundTime]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const required: Array<[string, string]> = [
      ["宠物类型", form.type],
      ["发现地点", form.foundLocation],
      ["发现时间", form.foundTime],
      ["联系人", form.contactName],
      ["联系方式", form.contactPhone]
    ];
    const missing = required.find(([, value]) => !String(value).trim());
    if (missing) {
      toast.error(`请填写${missing[0]}`);
      return;
    }
    if (!agreed) {
      toast.error("请先阅读并同意信息发布协议。");
      return;
    }

    setPublishing(true);
    try {
      const result = await createPet("found", {
        images,
        type: form.type,
        breed: form.breed,
        gender: form.gender,
        color: form.color,
        time: form.foundTime.replace("T", " "),
        location: form.foundLocation,
        contactName: form.contactName,
        contactPhone: form.contactPhone,
        description: form.description,
        traits: form.traits,
        aiInfo
      });
      toast.success("发布成功，希望它早日回家。");
      router.push(`/found-detail/?id=${encodeURIComponent(result.id)}`);
    } catch {
      toast.error("发布失败，请稍后重试");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-76px)] bg-[#fff8f1] py-8">
        <div className="container-page">
          <div className="mb-6 flex items-center gap-5">
            <Link href="/found" className="flex h-12 w-12 items-center justify-center rounded-full border border-orange-200 bg-white text-primary shadow-sm"><ArrowLeft className="h-6 w-6" /></Link>
            <div>
              <h1 className="text-4xl font-black">发布待领养宠物信息</h1>
              <p className="mt-2 text-sm text-[#6d6258]">填写发现的宠物信息，保存到统一数据接口，PC 和手机端会同步显示。</p>
            </div>
          </div>

          <Card className="grid min-h-[680px] grid-cols-[420px_1fr] overflow-hidden rounded-2xl">
            <aside className="border-r border-[#eadfd3] bg-gradient-to-b from-[#fff7ec] to-[#fffdf9] p-7">
              <p className="text-lg font-bold">{progressText}</p>
              <h2 className="mt-1 text-2xl font-black">宠物照片</h2>
              <p className="mt-3 text-sm leading-6 text-[#6d6258]">上传清晰照片，有助主人识别。</p>
              <div className="mt-6"><PhotoUploader images={images} onChange={setImages} compact /></div>
              <Card className="mt-6 border-orange-200 bg-orange-50/70 p-5 shadow-none">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="flex items-center gap-2 font-black"><Sparkles className="h-5 w-5 text-primary" />AI识别宠物信息</h3>
                    <p className="mt-2 text-sm leading-6 text-[#6d6258]">上传照片后自动识别类型、品种、颜色和特征。</p>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={runAIAnalyze} disabled={aiLoading}>
                    {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {aiLoading ? "识别中" : "AI识别"}
                  </Button>
                </div>
                {aiInfo && <div className="mt-4 space-y-2 text-sm"><p><b>品种：</b>{aiInfo.breed}</p><p><b>颜色：</b>{aiInfo.color.join("、")}</p><p><b>特征：</b>{aiInfo.features.join("、")}</p><p><b>置信度：</b>{aiInfo.confidence}%</p></div>}
              </Card>
            </aside>

            <form onSubmit={submit} className="flex min-h-0 flex-col bg-white">
              <div className="min-h-0 flex-1 overflow-y-auto p-8">
                <FormSection number="1" title="宠物外观">
                  <div className="grid grid-cols-3 gap-6">
                    <Field label="宠物类型 *"><TypeButtons value={form.type} onChange={(value) => update("type", value)} /></Field>
                    <Field label="品种"><Input value={form.breed} onChange={(event) => update("breed", event.target.value)} placeholder="如：橘猫 / 泰迪 / 金毛" className="h-12" /></Field>
                    <Field label="性别"><Input value={form.gender} onChange={(event) => update("gender", event.target.value)} className="h-12" /></Field>
                  </div>
                  <div className="mt-6 grid grid-cols-[1fr_2fr] gap-6">
                    <Field label="颜色"><Input value={form.color} onChange={(event) => update("color", event.target.value)} placeholder="如：橘色、黑色、白色" className="h-12" /></Field>
                    <Field label="明显特征"><Input value={form.traits} onChange={(event) => update("traits", event.target.value)} placeholder="如：戴项圈、尾巴短、左耳有伤痕" className="h-12" /></Field>
                  </div>
                </FormSection>

                <FormSection number="2" title="发现信息">
                  <div className="grid grid-cols-2 gap-6">
                    <Field label="发现地点 *"><Input value={form.foundLocation} onChange={(event) => update("foundLocation", event.target.value)} placeholder="如：小区 / 路口 / 商场入口 / 公园" className="h-12" /></Field>
                    <Field label="发现时间 *"><Input type="datetime-local" value={form.foundTime} onChange={(event) => update("foundTime", event.target.value)} className="h-12" /></Field>
                  </div>
                  <Field label="补充说明" className="mt-6"><Textarea value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="请描述宠物当时状态、是否受伤、是否安置等情况" className="min-h-[96px]" /></Field>
                </FormSection>

                <FormSection number="3" title="联系方式">
                  <div className="grid grid-cols-2 gap-6">
                    <Field label="联系人 *"><Input value={form.contactName} onChange={(event) => update("contactName", event.target.value)} placeholder="请输入姓名或昵称" className="h-12" /></Field>
                    <Field label="联系方式 *"><Input value={form.contactPhone} onChange={(event) => update("contactPhone", event.target.value)} placeholder="手机号 / 微信 / 其他联系方式" className="h-12" /></Field>
                  </div>
                  <label className="mt-5 flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#51483f]">
                    <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="h-4 w-4 accent-[#ff6a00]" />
                    我已阅读并同意 <span className="text-primary">《信息发布协议》</span>，承诺所填信息真实有效
                  </label>
                </FormSection>
              </div>

              <div className="flex items-center justify-center gap-4 border-t border-[#eadfd3] bg-[#fffaf5] px-8 py-5">
                <Link href="/found"><Button type="button" variant="secondary" className="min-w-44">取消</Button></Link>
                <Button type="submit" className="min-w-56" disabled={publishing}>{publishing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}发布信息</Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </>
  );
}

function FormSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <section className="mb-8"><div className="mb-5 flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-50 text-base font-black text-primary">{number}</span><h2 className="text-2xl font-black">{title}</h2></div>{children}</section>;
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={className}><Label className="mb-2 block">{label}</Label>{children}</div>;
}

function TypeButtons({ value, onChange }: { value: PetType; onChange: (value: PetType) => void }) {
  return <div className="grid h-12 grid-cols-3 overflow-hidden rounded-xl border border-[#e3d8cc] bg-white">{(["猫", "狗", "其他"] as PetType[]).map((type) => <button type="button" key={type} onClick={() => onChange(type)} className={value === type ? "bg-primary font-bold text-white" : "font-semibold text-[#2f2822] hover:bg-orange-50"}>{type}</button>)}</div>;
}

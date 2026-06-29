"use client";

import { ArrowLeft, ChevronRight, Loader2, MapPin, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BottomNav } from "@/components/mobile/BottomNav";
import { AiInfoPanel } from "@/components/mobile/AiInfoPanel";
import { ImageUploader } from "@/components/mobile/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { analyzePet, createPet, geocodeAddress, type MobilePostKind } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AIPetInfo, PetType } from "@/lib/local-store";

export function MobilePostPage() {
  const [images, setImages] = useState<string[]>([]);
  const [kind, setKind] = useState<MobilePostKind>("lost");
  const [type, setType] = useState<PetType | "">("");
  const [gender, setGender] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [breed, setBreed] = useState("");
  const [color, setColor] = useState("");
  const [traits, setTraits] = useState("");
  const [description, setDescription] = useState("");
  const [aiInfo, setAiInfo] = useState<AIPetInfo | undefined>();
  const [aiLoading, setAiLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [locating, setLocating] = useState(false);

  const runAI = async () => {
    if (!images[0]) {
      toast.error("请先上传宠物照片");
      return;
    }
    setAiLoading(true);
    try {
      const result = await analyzePet(images[0]);
      setAiInfo(result);
      if (result.petType === "cat") setType("猫");
      if (result.petType === "dog") setType("狗");
      setBreed(result.breed || breed);
      setColor(result.color.join("、") || color);
      setTraits(result.features.join("、") || traits);
      setDescription(result.description || description);
      toast.success("AI 识别完成");
    } catch {
      toast.error("AI 识别失败，你仍然可以手动发布");
    } finally {
      setAiLoading(false);
    }
  };

  const locate = async () => {
    setLocating(true);
    try {
      const result = await geocodeAddress(location) as { map_address?: string };
      if (result.map_address) setLocation(result.map_address);
      toast.success("定位地址已更新");
    } catch {
      toast.error("地图服务未配置，请手动填写地点");
    } finally {
      setLocating(false);
    }
  };

  const submit = async () => {
    if (!type || !time.trim() || !location.trim() || !contactName.trim() || !contactPhone.trim()) {
      toast.error("请完善必填信息");
      return;
    }
    setPublishing(true);
    try {
      const result = await createPet(kind, { images, type: type as PetType, breed, gender, color, time, location, contactName, contactPhone, description, traits, aiInfo });
      toast.success("发布成功");
      window.location.href = result.kind === "lost" ? `/pet-detail/?id=${encodeURIComponent(result.id)}` : `/found-detail/?id=${encodeURIComponent(result.id)}`;
    } catch {
      toast.error("发布失败，请稍后重试");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f1] pb-[calc(88px+env(safe-area-inset-bottom))] md:hidden">
      <main className="mx-auto max-w-md px-4 pb-6 pt-4">
        <header className="mb-5 grid grid-cols-[44px_1fr_64px] items-center">
          <button type="button" onClick={() => history.back()} className="flex h-11 w-11 items-center justify-center rounded-full text-[#252525]">
            <ArrowLeft className="h-7 w-7" />
          </button>
          <h1 className="text-center text-xl font-black">发布宠物信息</h1>
          <button type="button" className="text-right text-sm font-bold text-[#252525]" onClick={() => toast.message("草稿箱将在后续版本开放")}>草稿箱</button>
        </header>

        <Section title="上传照片" step="1" hint="最多 6 张">
          <ImageUploader images={images} onChange={setImages} />
        </Section>

        <Section
          title="AI识别结果"
          step="2"
          hint="可编辑"
          action={
            <Button type="button" size="sm" variant="outline" className="h-9 rounded-xl border-primary/30 text-primary" onClick={runAI} disabled={aiLoading}>
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {aiLoading ? "识别中" : "识别"}
            </Button>
          }
        >
          {aiInfo ? <AiInfoPanel aiInfo={aiInfo} /> : (
            <div className="rounded-2xl border border-dashed border-primary/25 bg-orange-50/60 p-4 text-sm leading-6 text-[#666]">
              上传照片后点击 AI 识别，系统会自动填充宠物类型、毛色、品种、体型、年龄和明显特征。
            </div>
          )}
        </Section>

        <Section title="基本信息" step="3" hint="请完善">
          <div className="grid grid-cols-2 rounded-2xl bg-orange-50 p-1">
            {[["lost", "寻宠"], ["found", "待领养"]].map(([value, label]) => (
              <button key={value} type="button" onClick={() => setKind(value as MobilePostKind)} className={cn("h-11 rounded-xl font-black", kind === value && "bg-white text-primary shadow-sm")}>{label}</button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(["狗", "猫", "其他"] as PetType[]).map((item) => <Chip key={item} active={type === item} onClick={() => setType(item)}>{item}</Chip>)}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {["公", "母", "未知"].map((item) => <Chip key={item} active={gender === item} onClick={() => setGender(item)}>{item}</Chip>)}
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-primary/15 bg-white">
            <RowInput label="品种" value={breed} onChange={setBreed} placeholder="如：柯基 / 橘猫" />
            <RowInput label="毛色" value={color} onChange={setColor} placeholder="如：黄白色" />
            <RowInput label="时间" value={time} onChange={setTime} placeholder="如：2026-06-28 18:30" />
            <RowInput label="详细地点" value={location} onChange={setLocation} placeholder="请输入详细地点" right={locating ? <Loader2 className="h-5 w-5 animate-spin" /> : <MapPin className="h-5 w-5" />} onRightClick={locate} />
            <RowInput label="联系电话" value={contactPhone} onChange={setContactPhone} placeholder="手机号 / 微信" />
            <RowInput label="联系人" value={contactName} onChange={setContactName} placeholder="请输入称呼" />
          </div>

          <Textarea className="mt-4 min-h-20 rounded-2xl bg-white" value={traits} onChange={(e) => setTraits(e.target.value)} placeholder="明显特征，如耳朵、尾巴、项圈等" />
          <Textarea className="mt-3 min-h-20 rounded-2xl bg-white" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="补充描述（选填）" />
        </Section>

        <section className="rounded-3xl bg-white p-4 shadow-card">
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" className="h-14 rounded-2xl border-primary/30 text-base text-primary" onClick={runAI} disabled={aiLoading}>
              {aiLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              {aiLoading ? "识别中" : "AI识别"}
            </Button>
            <Button type="button" className="h-14 rounded-2xl bg-primary text-base hover:bg-primary/90" onClick={submit} disabled={publishing}>
              {publishing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              {publishing ? "发布中" : "发布信息"}
            </Button>
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}

function Section({ step, title, hint, action, children }: { step: string; title: string; hint?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mb-4 rounded-3xl bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex min-w-0 items-center gap-2 text-lg font-black text-primary">
          <Step n={step} />
          <span className="shrink-0">{title}</span>
          {hint && <span className="text-sm font-normal text-[#666]">{hint}</span>}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Step({ n }: { n: string }) {
  return <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-white">{n}</span>;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={cn("flex h-10 items-center justify-center gap-1 rounded-xl border border-primary/20 bg-white font-bold", active && "border-primary bg-primary text-white")}>{children}</button>;
}

function RowInput({ label, value, onChange, placeholder, right, onRightClick }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; right?: React.ReactNode; onRightClick?: () => void }) {
  return (
    <label className="grid min-h-12 grid-cols-[82px_1fr_28px] items-center border-b border-primary/10 px-3 last:border-b-0">
      <span className="text-sm font-semibold text-[#5f4a38]">{label}</span>
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-10 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0" />
      <button type="button" onClick={onRightClick} className="flex h-8 w-8 items-center justify-center text-primary">
        {right || <ChevronRight className="h-5 w-5 text-[#999]" />}
      </button>
    </label>
  );
}

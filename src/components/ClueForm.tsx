"use client";

import { useState } from "react";
import { Camera, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addClue, makeId, type Clue } from "@/lib/local-store";

export function ClueForm({
  petId,
  onSuccess,
  compact
}: {
  petId: string;
  onSuccess?: (clue: Clue) => void;
  compact?: boolean;
}) {
  const [image, setImage] = useState("");
  const [form, setForm] = useState({
    finderName: "",
    finderContact: "",
    seenTime: "",
    seenLocation: "",
    message: ""
  });

  const update = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.seenLocation.trim() || !form.finderContact.trim() || !form.message.trim()) {
      toast.error("请填写发现地点、联系方式和补充说明。");
      return;
    }
    const clue: Clue = {
      id: makeId("clue"),
      petId,
      finderName: form.finderName.trim() || "热心人",
      finderContact: form.finderContact.trim(),
      seenTime: form.seenTime || new Date().toISOString().slice(0, 16).replace("T", " "),
      seenLocation: form.seenLocation.trim(),
      message: form.message.trim(),
      image,
      createdAt: new Date().toISOString()
    };
    addClue(petId, clue);
    toast.success("线索提交成功，主人会尽快查看。");
    onSuccess?.(clue);
    setForm({ finderName: "", finderContact: "", seenTime: "", seenLocation: "", message: "" });
    setImage("");
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field compact={compact} label="发现时间">
        <Input type="datetime-local" value={form.seenTime} onChange={(event) => update("seenTime", event.target.value)} />
      </Field>
      <Field compact={compact} label="发现地点">
        <Input value={form.seenLocation} onChange={(event) => update("seenLocation", event.target.value)} placeholder="请输入发现地点" />
      </Field>
      <Field compact={compact} label="联系人">
        <Input value={form.finderName} onChange={(event) => update("finderName", event.target.value)} placeholder="你的称呼" />
      </Field>
      <Field compact={compact} label="联系方式">
        <Input value={form.finderContact} onChange={(event) => update("finderContact", event.target.value)} placeholder="手机号 / 微信" />
      </Field>
      <Field compact={compact} label="现场照片">
        <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#ddd2c5] bg-white text-sm text-[#756a60] hover:border-primary hover:bg-orange-50">
          <Camera className="h-4 w-4" />
          {image ? "已上传现场照片" : "点击上传现场照片"}
          <input type="file" accept="image/*" className="hidden" onChange={async (event) => setImage(await fileToDataUrl(event.target.files?.[0]))} />
        </label>
      </Field>
      <Field compact={compact} label="补充说明">
        <Textarea value={form.message} onChange={(event) => update("message", event.target.value)} placeholder="请描述你看到的情况" className={compact ? "min-h-[86px]" : ""} />
      </Field>
      <Button type="submit" className="w-full">
        <Send className="h-4 w-4" />提交线索
      </Button>
    </form>
  );
}

function Field({ label, children, compact }: { label: string; children: React.ReactNode; compact?: boolean }) {
  return (
    <div className={compact ? "grid grid-cols-[100px_1fr] items-center gap-3" : "space-y-1"}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function fileToDataUrl(file?: File) {
  return new Promise<string>((resolve) => {
    if (!file) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

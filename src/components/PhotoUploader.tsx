"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Plus, RotateCcw, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { SafePetImage } from "@/components/SafePetImage";
import { cn } from "@/lib/utils";
import { uploadPetImage, validatePetImage } from "@/lib/upload";

type UploadingItem = {
  id: string;
  file: File;
  progress: number;
  error?: string;
};

export function PhotoUploader({
  images,
  onChange,
  compact = false
}: {
  images: string[];
  onChange: (images: string[]) => void;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingItem[]>([]);
  const [dragging, setDragging] = useState(false);

  const uploadOne = async (file: File, id = crypto.randomUUID()) => {
    const validation = validatePetImage(file);
    if (!validation.valid) {
      toast.error(validation.message);
      return null;
    }

    setUploading((items) => [...items.filter((item) => item.id !== id), { id, file, progress: 0 }]);
    try {
      const url = await uploadPetImage(file, {
        retries: 2,
        fallbackToDataUrl: false,
        onProgress: (progress) => {
          setUploading((items) => items.map((item) => item.id === id ? { ...item, progress: progress.percent } : item));
        }
      });
      setUploading((items) => items.filter((item) => item.id !== id));
      if (url.startsWith("data:")) {
        toast.warning("R2 上传暂不可用，已使用本地预览。部署到 Cloudflare Pages 后请确认 BUCKET 已绑定。");
      } else {
        toast.success("图片上传成功");
      }
      return url;
    } catch (error) {
      const message = error instanceof Error ? error.message : "图片上传失败";
      setUploading((items) => items.map((item) => item.id === id ? { ...item, error: message } : item));
      toast.error(message);
      return null;
    }
  };

  const upload = async (files: FileList | File[] | null) => {
    if (!files) return;
    const freeSlots = Math.max(0, 5 - images.length - uploading.length);
    const selected = Array.from(files).slice(0, freeSlots);
    if (!selected.length) {
      toast.error("最多上传 5 张照片");
      return;
    }

    const uploaded: string[] = [];
    for (const file of selected) {
      const url = await uploadOne(file);
      if (url) uploaded.push(url);
    }
    if (uploaded.length) onChange([...images, ...uploaded]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const dropClass = dragging ? "border-primary bg-orange-50 ring-4 ring-orange-100" : "border-[#d7ccc0] bg-white";

  return (
    <div className="flex flex-wrap gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void upload(event.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl border border-dashed text-primary transition hover:border-primary hover:bg-orange-50",
          compact ? "h-40 w-full" : "h-44 w-44",
          dropClass
        )}
      >
        {dragging ? <UploadCloud className="mb-3 h-9 w-9" /> : <Camera className="mb-3 h-9 w-9" fill="currentColor" />}
        <span className="font-semibold text-[#3b3129]">{dragging ? "松开即可上传" : "点击或拖拽上传"}</span>
        <span className="mt-3 px-4 text-center text-xs leading-5 text-[#8d8278]">支持 JPG / PNG / WebP，最多 5 张，单张 10MB</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(event) => upload(event.target.files)}
      />

      {images.map((image, index) => (
        <div key={`${image}-${index}`} className="relative">
          <SafePetImage src={image} alt={`宠物照片 ${index + 1}`} className="h-20 w-20 rounded-xl" />
          <button type="button" onClick={() => onChange(images.filter((item) => item !== image))} className="absolute right-1 top-1 rounded-full bg-black/55 p-0.5 text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      {uploading.map((item) => (
        <div key={item.id} className="flex h-20 w-20 flex-col items-center justify-center rounded-xl border border-dashed border-[#d7ccc0] bg-white p-2 text-center text-xs">
          {item.error ? (
            <button type="button" onClick={() => uploadOne(item.file, item.id).then((url) => url && onChange([...images, url]))} className="flex flex-col items-center gap-1 text-primary">
              <RotateCcw className="h-5 w-5" />
              重试
            </button>
          ) : (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="mt-1 font-bold text-[#5f4a38]">{item.progress}%</span>
            </>
          )}
        </div>
      ))}

      {images.length + uploading.length > 0 && images.length + uploading.length < 5 && (
        <button type="button" onClick={() => inputRef.current?.click()} className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-[#d7ccc0] bg-white text-[#7d7167]">
          <Plus className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}

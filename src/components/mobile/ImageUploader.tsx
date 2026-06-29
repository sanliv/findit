"use client";

import { Camera, Loader2, Plus, RotateCcw, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { SafePetImage } from "@/components/SafePetImage";
import { uploadPetImage, validatePetImage } from "@/lib/upload";

type UploadingItem = { id: string; file: File; progress: number; error?: string };

export function ImageUploader({ images, onChange, max = 6 }: { images: string[]; onChange: (images: string[]) => void; max?: number }) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingItem[]>([]);

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
      if (url.startsWith("data:")) toast.warning("R2 上传暂不可用，已使用本地预览。");
      else toast.success("图片上传成功");
      return url;
    } catch (error) {
      const message = error instanceof Error ? error.message : "上传失败，请重试";
      setUploading((items) => items.map((item) => item.id === id ? { ...item, error: message } : item));
      toast.error(message);
      return null;
    }
  };

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    const slots = Math.max(0, max - images.length - uploading.length);
    const selected = Array.from(files).slice(0, slots);
    const uploaded: string[] = [];
    for (const file of selected) {
      const url = await uploadOne(file);
      if (url) uploaded.push(url);
    }
    if (uploaded.length) onChange([...images, ...uploaded]);
    if (cameraRef.current) cameraRef.current.value = "";
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {images.map((image, index) => (
        <div key={`${image}-${index}`} className="relative">
          <SafePetImage src={image} alt={`宠物照片 ${index + 1}`} className="aspect-square rounded-2xl" />
          <button type="button" onClick={() => onChange(images.filter((_, i) => i !== index))} className="absolute right-1.5 top-1.5 rounded-full bg-black/50 p-1 text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}

      {uploading.map((item) => (
        <div key={item.id} className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-primary-border)] bg-white text-center text-xs">
          {item.error ? (
            <button type="button" onClick={() => uploadOne(item.file, item.id).then((url) => url && onChange([...images, url]))} className="flex flex-col items-center gap-1 text-[var(--color-primary)]">
              <RotateCcw className="h-5 w-5" />
              重试
            </button>
          ) : (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-[var(--color-primary)]" />
              <span className="mt-1 font-bold">{item.progress}%</span>
            </>
          )}
        </div>
      ))}

      {images.length + uploading.length < max && (
        <>
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-primary-border)] bg-white text-[#5f6c7a]">
            <Camera className="mb-2 h-7 w-7 text-[var(--color-primary)]" />
            <span className="text-sm font-semibold">拍摄</span>
            <input ref={cameraRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" capture="environment" className="hidden" onChange={(event) => onFiles(event.target.files)} />
          </label>
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-primary-border)] bg-white text-[#5f6c7a]">
            <Plus className="mb-2 h-7 w-7" />
            <span className="text-sm font-semibold">添加</span>
            <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple className="hidden" onChange={(event) => onFiles(event.target.files)} />
          </label>
        </>
      )}

      {Array.from({ length: Math.max(0, max - images.length - uploading.length - 2) }).map((_, index) => (
        <div key={index} className="aspect-square rounded-2xl border border-dashed border-[#f1dcc8] bg-[#fffaf5]" />
      ))}
    </div>
  );
}

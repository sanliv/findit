"use client";

export type UploadProgress = {
  loaded: number;
  total: number;
  percent: number;
};

const maxSize = 10 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export function validatePetImage(file: File): { valid: boolean; message?: string } {
  if (!allowedTypes.has(file.type)) {
    return { valid: false, message: "仅支持 jpg、jpeg、png、webp 图片" };
  }
  if (file.size > maxSize) {
    return { valid: false, message: "单张图片不能超过 10MB" };
  }
  return { valid: true };
}

function assertValidPetImage(file: File) {
  const result = validatePetImage(file);
  if (!result.valid) throw new Error(result.message);
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("本地预览生成失败，请重试"));
    reader.readAsDataURL(file);
  });
}

function uploadOnce(file: File, onProgress?: (progress: UploadProgress) => void) {
  assertValidPetImage(file);
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append("file", file);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.({
        loaded: event.loaded,
        total: event.total,
        percent: Math.round((event.loaded / event.total) * 100)
      });
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText || "{}") as { success?: boolean; url?: string; data?: { url?: string }; message?: string };
        const url = data.data?.url ?? data.url;
        if (xhr.status >= 200 && xhr.status < 300 && data.success && url) {
          onProgress?.({ loaded: file.size, total: file.size, percent: 100 });
          resolve(url);
          return;
        }
        reject(new Error(data.message || `上传失败：HTTP ${xhr.status}`));
      } catch {
        reject(new Error(`上传失败：HTTP ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("网络异常，图片上传失败"));
    xhr.open("POST", "/api/upload");
    xhr.send(form);
  });
}

export async function uploadPetImage(
  file: File,
  options?: {
    retries?: number;
    fallbackToDataUrl?: boolean;
    onProgress?: (progress: UploadProgress) => void;
  }
) {
  const retries = options?.retries ?? 2;
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await uploadOnce(file, options?.onProgress);
    } catch (error) {
      lastError = error;
      if (attempt < retries) await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  if (options?.fallbackToDataUrl) return fileToDataUrl(file);
  throw lastError instanceof Error ? lastError : new Error("图片上传失败，请重试");
}

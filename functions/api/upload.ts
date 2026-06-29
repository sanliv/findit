import { error, json } from "../_lib/response";

type R2BucketLike = {
  put(key: string, value: ArrayBuffer, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
};

type Env = {
  BUCKET?: R2BucketLike;
  R2_PUBLIC_URL?: string;
};

const maxSize = 10 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

function extensionFromFile(file: File) {
  const nameExt = file.name.split(".").pop()?.toLowerCase();
  if (nameExt && ["jpg", "jpeg", "png", "webp"].includes(nameExt)) return nameExt === "jpeg" ? "jpg" : nameExt;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

function fallbackUrl(request: Request, key: string) {
  const base = new URL(request.url);
  return `${base.protocol}//${base.host}/api/images/${key}`;
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    if (!env.BUCKET) return error("R2 存储桶未绑定，请在 Cloudflare Pages 中绑定名称 BUCKET。", 500);

    const form = await request.formData();
    const file = form.get("file") ?? form.get("image");
    if (!(file instanceof File)) return error("请使用 multipart/form-data 并通过 file 字段上传图片。", 400);
    if (!allowedTypes.has(file.type)) return error("仅支持 jpg、jpeg、png、webp 图片。", 400);
    if (file.size > maxSize) return error("单张图片不能超过 10MB。", 400);

    const ext = extensionFromFile(file);
    const key = `images/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    await env.BUCKET.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });

    const publicBase = env.R2_PUBLIC_URL?.replace(/\/$/, "");
    const url = publicBase ? `${publicBase}/${key}` : fallbackUrl(request, key);
    return json({
      success: true,
      url,
      key,
      data: { url, key },
      warning: publicBase ? undefined : "未配置 R2_PUBLIC_URL，当前返回 Pages Functions 代理图片地址。"
    });
  } catch (err) {
    return error(err instanceof Error ? err.message : "图片上传失败，请稍后再试。", 500);
  }
}

export function onRequestGet() {
  return json({ success: false, message: "请使用 POST 上传图片。" }, 405);
}

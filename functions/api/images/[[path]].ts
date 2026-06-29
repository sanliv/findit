import { error } from "../../_lib/response";

type R2ObjectLike = {
  body: ReadableStream;
  httpMetadata?: { contentType?: string };
};

type R2BucketLike = {
  get(key: string): Promise<R2ObjectLike | null>;
};

type Env = {
  BUCKET?: R2BucketLike;
};

export async function onRequestGet({ env, params }: { env: Env; params: { path?: string | string[] } }) {
  if (!env.BUCKET) return error("R2 存储桶未绑定，请绑定名称 BUCKET。", 500);
  const raw = params.path;
  const key = Array.isArray(raw) ? raw.join("/") : raw || "";
  if (!key) return error("图片路径为空。", 400);
  const object = await env.BUCKET.get(key);
  if (!object) return error("图片不存在。", 404);
  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType || "image/jpeg",
      "cache-control": "public, max-age=31536000, immutable"
    }
  });
}

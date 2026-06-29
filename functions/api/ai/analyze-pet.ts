import { json } from "../../_lib/response";

type Env = {
  DOUBAO_API_KEY?: string;
  DOUBAO_API_URL?: string;
  DOUBAO_MODEL?: string;
};

type AnalyzeResult = {
  species: string;
  breed: string;
  color: string;
  age: string;
  gender: string;
  features: string;
  collar: string;
  summary: string;
};

const fallbackUrl = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

function parseJsonObject(text: string) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
  return JSON.parse(cleaned);
}

function normalizeText(value: unknown, fallback = "未知") {
  const text = typeof value === "string" ? value.trim() : "";
  return text || fallback;
}

function normalizeResult(value: Record<string, unknown>): AnalyzeResult {
  const features = Array.isArray(value.features) ? value.features.map(String).join("，") : normalizeText(value.features);
  const color = Array.isArray(value.color) ? value.color.map(String).join("，") : normalizeText(value.color);
  return {
    species: normalizeText(value.species ?? value.petType),
    breed: normalizeText(value.breed),
    color,
    age: normalizeText(value.age ?? value.ageGuess),
    gender: normalizeText(value.gender ?? value.genderGuess),
    features,
    collar: normalizeText(value.collar),
    summary: normalizeText(value.summary ?? value.description, "图片识别完成，请结合实际情况人工确认。")
  };
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    const body = await request.json() as { imageUrl?: string; type?: "lost" | "found" };
    if (!body.imageUrl) return json({ success: false, message: "缺少 imageUrl" }, 400);
    if (!env.DOUBAO_API_KEY) return json({ success: false, message: "缺少 DOUBAO_API_KEY" }, 400);

    const model = env.DOUBAO_MODEL || "doubao-seed-1-8-vision";
    const apiUrl = env.DOUBAO_API_URL || fallbackUrl;
    const prompt = `你是 AI 寻宠 / 拾宠平台的宠物图片识别助手。请根据图片识别宠物信息，只返回 JSON，不要解释。
字段：
species: "猫" | "狗" | "其他" | "未知"
breed: string
color: string
age: string
gender: string
features: string
collar: string
summary: string
要求中文输出；不确定的字段填"未知"；features 写出可用于寻宠匹配的明显特征。`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.DOUBAO_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: body.imageUrl } }
            ]
          }
        ],
        temperature: 0.1
      })
    });

    const raw = await response.json().catch(async () => ({ error: await response.text().catch(() => "") })) as Record<string, unknown>;
    if (!response.ok) {
      return json({ success: false, message: `豆包 Vision 调用失败：HTTP ${response.status}`, raw }, 502);
    }

    const choices = raw.choices as Array<{ message?: { content?: string } }> | undefined;
    const content = choices?.[0]?.message?.content;
    if (!content) return json({ success: false, message: "豆包 Vision 返回为空", raw }, 502);

    const data = normalizeResult(parseJsonObject(content) as Record<string, unknown>);
    return json({ success: true, data, raw });
  } catch (err) {
    return json({ success: false, message: err instanceof Error ? err.message : "AI 识别失败" }, 500);
  }
}

export function onRequestGet() {
  return json({ success: false, message: "请使用 POST 调用 AI 识别接口。" }, 405);
}

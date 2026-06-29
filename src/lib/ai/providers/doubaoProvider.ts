import type { AIPetInfo, AnalyzePetInput, PetAnalyzerProvider } from "@/lib/ai/types";

const fallbackUrl = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

function toImageUrl(input: AnalyzePetInput) {
  if (input.imageUrl) return input.imageUrl;
  const raw = input.imageBase64 ?? "";
  if (raw.startsWith("data:")) return raw;
  return `data:image/jpeg;base64,${raw}`;
}

function parseJsonObject(text: string) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
  return JSON.parse(cleaned);
}

function normalize(value: Partial<AIPetInfo> & Record<string, unknown>): AIPetInfo {
  return {
    petType: value.petType === "cat" || value.petType === "dog" || value.petType === "other" ? value.petType : "",
    breed: typeof value.breed === "string" ? value.breed : "",
    color: Array.isArray(value.color) ? value.color.map(String).filter(Boolean) : [],
    pattern: Array.isArray(value.pattern) ? value.pattern.map(String).filter(Boolean) : [],
    size: value.size === "small" || value.size === "medium" || value.size === "large" ? value.size : "",
    ageGuess: typeof value.ageGuess === "string" ? value.ageGuess : "",
    genderGuess: typeof value.genderGuess === "string" ? value.genderGuess : "",
    features: Array.isArray(value.features) ? value.features.map(String).filter(Boolean) : [],
    description: typeof value.description === "string" ? value.description : "",
    confidence: typeof value.confidence === "number" ? Math.max(0, Math.min(100, value.confidence)) : 70,
    raw: value
  };
}

export const doubaoProvider: PetAnalyzerProvider = {
  name: "doubao",
  async analyzePet(input: AnalyzePetInput) {
    const env: Partial<NodeJS.ProcessEnv> = typeof process !== "undefined" ? process.env : {};
    const apiKey = env.DOUBAO_API_KEY;
    if (!apiKey) throw new Error("缺少 DOUBAO_API_KEY，请先在 Cloudflare Pages 环境变量中配置。");
    const model = env.DOUBAO_MODEL || "doubao-seed-1-8-vision";
    const apiUrl = env.DOUBAO_API_URL || fallbackUrl;
    const prompt = "你是寻宠平台的宠物识别助手。请根据图片识别宠物信息，只返回 JSON。字段：petType, breed, color, pattern, size, ageGuess, genderGuess, features, description, confidence。中文输出。";
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: toImageUrl(input) } }
            ]
          }
        ],
        temperature: 0.1
      })
    });
    if (!response.ok) throw new Error(`豆包识图失败：HTTP ${response.status}`);
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("豆包识图返回为空。");
    return normalize(parseJsonObject(content));
  }
};

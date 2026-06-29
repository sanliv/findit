import type { AIProviderName, AnalyzePetInput, PetAnalyzerProvider } from "@/lib/ai/types";
import { doubaoProvider } from "@/lib/ai/providers/doubaoProvider";

export function getAIProviderName(): AIProviderName {
  const provider = (process.env.AI_PROVIDER || "doubao").toLowerCase();
  if (provider === "baidu" || provider === "tencent" || provider === "doubao") return provider;
  return "doubao";
}

export function getPetAnalyzerProvider(): PetAnalyzerProvider {
  const provider = getAIProviderName();
  if (provider === "doubao") return doubaoProvider;
  throw new Error(`${provider} 图像识别 Provider 已预留，当前真实数据版本请使用 AI_PROVIDER=doubao。`);
}

export async function analyzePetWithConfiguredProvider(input: AnalyzePetInput) {
  return getPetAnalyzerProvider().analyzePet(input);
}

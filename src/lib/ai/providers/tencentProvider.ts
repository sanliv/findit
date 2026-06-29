import type { AnalyzePetInput, PetAnalyzerProvider } from "@/lib/ai/types";

export const tencentProvider: PetAnalyzerProvider = {
  name: "tencent",
  async analyzePet(_input: AnalyzePetInput) {
    const env: Partial<NodeJS.ProcessEnv> = typeof process !== "undefined" ? process.env : {};
    const secretId = env.TENCENT_SECRET_ID;
    const secretKey = env.TENCENT_SECRET_KEY;
    if (!secretId || !secretKey) {
      throw new Error("缺少 TENCENT_SECRET_ID 或 TENCENT_SECRET_KEY，请先在 Cloudflare Pages 环境变量中配置。");
    }
    throw new Error("腾讯云图像检索 Provider 已预留接口，当前真实数据版本请使用 AI_PROVIDER=doubao。");
  }
};

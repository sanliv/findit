import type { AnalyzePetInput, PetAnalyzerProvider } from "@/lib/ai/types";

export const baiduProvider: PetAnalyzerProvider = {
  name: "baidu",
  async analyzePet(_input: AnalyzePetInput) {
    const env: Partial<NodeJS.ProcessEnv> = typeof process !== "undefined" ? process.env : {};
    const apiKey = env.BAIDU_API_KEY;
    const secretKey = env.BAIDU_SECRET_KEY;
    if (!apiKey || !secretKey) {
      throw new Error("缺少 BAIDU_API_KEY 或 BAIDU_SECRET_KEY，请先在 Cloudflare Pages 环境变量中配置。");
    }
    throw new Error("百度动物识别 Provider 已预留接口，当前真实数据版本请使用 AI_PROVIDER=doubao。");
  }
};

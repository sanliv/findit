export type AIPetType = "cat" | "dog" | "other" | "";
export type AIPetSize = "small" | "medium" | "large" | "";

export type AIPetInfo = {
  petType: AIPetType;
  breed: string;
  color: string[];
  pattern: string[];
  size: AIPetSize;
  ageGuess: string;
  genderGuess: string;
  features: string[];
  description: string;
  confidence: number;
  raw?: unknown;
};

export type AIMatchCandidate = {
  postId: string;
  score: number;
  reasons: string[];
};

export type AIMatchInfo = {
  lastMatchedAt: string;
  candidates: AIMatchCandidate[];
};

export type AIProviderName = "baidu" | "tencent" | "doubao";

export type AnalyzePetInput = {
  imageUrl?: string;
  imageBase64?: string;
  postId?: string;
};

export type PetAnalyzerProvider = {
  name: AIProviderName;
  analyzePet(input: AnalyzePetInput): Promise<AIPetInfo>;
};

export type MatchablePostKind = "lost" | "found";

export type MatchablePetPost = {
  id: string;
  kind: MatchablePostKind;
  name?: string;
  type: string;
  breed: string;
  gender?: string;
  age?: string;
  color: string;
  status?: string;
  location: string;
  time: string;
  traits: string;
  description?: string;
  images: string[];
  aiInfo?: AIPetInfo;
};

export type PetMatchResult = AIMatchCandidate & {
  pet: MatchablePetPost;
};

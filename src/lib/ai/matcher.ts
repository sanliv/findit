import type { AIPetInfo, MatchablePetPost, PetMatchResult } from "@/lib/ai/types";

const CAT_WORDS = ["cat", "猫", "猫咪"];
const DOG_WORDS = ["dog", "狗", "狗狗", "犬"];

function normalizeText(value: string | undefined) {
  return (value ?? "").toLowerCase().trim();
}

export function normalizePetType(value: string | undefined): "cat" | "dog" | "other" | "" {
  const text = normalizeText(value);
  if (!text) return "";
  if (CAT_WORDS.some((word) => text.includes(word.toLowerCase()))) return "cat";
  if (DOG_WORDS.some((word) => text.includes(word.toLowerCase()))) return "dog";
  return "other";
}

function tokenize(value: string | string[] | undefined) {
  const source = Array.isArray(value) ? value.join(" ") : value ?? "";
  return Array.from(
    new Set(
      source
        .split(/[\s,，、|;；。.!！?？()（）【】\[\]{}<>《》"'“”‘’/]+/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function overlap(left: string[], right: string[]) {
  const rightSet = new Set(right.map((item) => item.toLowerCase()));
  return left.filter((item) => rightSet.has(item.toLowerCase()));
}

function getColors(post: MatchablePetPost) {
  return tokenize([post.color, ...(post.aiInfo?.color ?? [])]);
}

function getFeatures(post: MatchablePetPost) {
  return tokenize([post.traits, post.description ?? "", ...(post.aiInfo?.features ?? []), ...(post.aiInfo?.pattern ?? [])]);
}

function isSimilarBreed(left: string, right: string) {
  const a = normalizeText(left);
  const b = normalizeText(right);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

function locationParts(location: string) {
  return tokenize(location).filter((part) => /省|市|区|县|镇|街道|附近|公园|小区|商场|路|地铁/.test(part));
}

function scoreTime(left: string, right: string) {
  const leftDate = Date.parse(left.replace(/年/g, "-").replace(/月/g, "-").replace(/日/g, ""));
  const rightDate = Date.parse(right.replace(/年/g, "-").replace(/月/g, "-").replace(/日/g, ""));
  if (Number.isNaN(leftDate) || Number.isNaN(rightDate)) return 4;
  const days = Math.abs(leftDate - rightDate) / 86400000;
  if (days <= 1) return 10;
  if (days <= 3) return 8;
  if (days <= 7) return 6;
  if (days <= 30) return 3;
  return 0;
}

export function scorePetMatch(source: MatchablePetPost, candidate: MatchablePetPost): PetMatchResult | null {
  if (source.kind === candidate.kind || source.id === candidate.id) return null;

  const reasons: string[] = [];
  let score = 0;

  const sourceType = normalizePetType(source.aiInfo?.petType || source.type);
  const candidateType = normalizePetType(candidate.aiInfo?.petType || candidate.type);
  if (sourceType && candidateType && sourceType === candidateType) {
    score += 25;
    reasons.push(`宠物类型一致：${sourceType === "cat" ? "猫" : sourceType === "dog" ? "狗" : "其他"}`);
  }

  const sourceBreed = source.aiInfo?.breed || source.breed;
  const candidateBreed = candidate.aiInfo?.breed || candidate.breed;
  if (isSimilarBreed(sourceBreed, candidateBreed)) {
    score += 15;
    reasons.push(`品种相似：${sourceBreed || candidateBreed}`);
  }

  const sameColors = overlap(getColors(source), getColors(candidate)).slice(0, 4);
  if (sameColors.length) {
    score += Math.min(20, 8 + sameColors.length * 6);
    reasons.push(`颜色相似：${sameColors.join("、")}`);
  }

  const sameFeatures = overlap(getFeatures(source), getFeatures(candidate)).slice(0, 4);
  if (sameFeatures.length) {
    score += Math.min(15, 5 + sameFeatures.length * 4);
    reasons.push(`特征相似：${sameFeatures.join("、")}`);
  }

  const sameLocations = overlap(locationParts(source.location), locationParts(candidate.location)).slice(0, 3);
  if (sameLocations.length) {
    score += sameLocations.length >= 2 ? 15 : 10;
    reasons.push(`地点接近：${sameLocations.join("、")}`);
  }

  const timeScore = scoreTime(source.time, candidate.time);
  if (timeScore > 0) {
    score += timeScore;
    reasons.push(`时间接近：${timeScore >= 8 ? "高度接近" : "可参考"}`);
  }

  return {
    postId: candidate.id,
    score: Math.min(100, Math.round(score)),
    reasons,
    pet: candidate
  };
}

export function matchPets(source: MatchablePetPost, candidates: MatchablePetPost[], threshold = 60, limit = 10) {
  return candidates
    .map((candidate) => scorePetMatch(source, candidate))
    .filter((result): result is PetMatchResult => result !== null && result.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function inferAIInfoFromPost(post: MatchablePetPost): AIPetInfo {
  const petType = normalizePetType(post.type);
  return {
    petType,
    breed: post.breed,
    color: tokenize(post.color),
    pattern: [],
    size: "",
    ageGuess: post.age ?? "",
    genderGuess: post.gender ?? "",
    features: tokenize(post.traits),
    description: post.description || post.traits || "",
    confidence: 60,
    raw: { source: "local-post" }
  };
}

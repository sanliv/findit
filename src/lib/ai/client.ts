"use client";

import type { AIPetInfo, PetMatchResult } from "@/lib/ai/types";
import type { FoundPet, LostPet } from "@/lib/local-store";

type AnalyzeResponse = {
  success: boolean;
  data?: {
    species?: string;
    breed?: string;
    color?: string;
    age?: string;
    gender?: string;
    features?: string;
    summary?: string;
  };
  raw?: unknown;
  message?: string;
};

type MatchResponse = {
  success: boolean;
  matches?: PetMatchResult[];
  matchInfo?: {
    lastMatchedAt: string;
    candidates: Array<{ postId: string; score: number; reasons: string[] }>;
  };
  message?: string;
};

function toAIInfo(data: NonNullable<AnalyzeResponse["data"]>, raw?: unknown): AIPetInfo {
  return {
    petType: /猫/.test(data.species ?? "") ? "cat" : /狗|犬/.test(data.species ?? "") ? "dog" : "other",
    breed: data.breed ?? "",
    color: data.color ? data.color.split(/[，、,\s]+/).filter(Boolean) : [],
    pattern: [],
    size: "",
    ageGuess: data.age ?? "",
    genderGuess: data.gender ?? "",
    features: data.features ? data.features.split(/[，、,;；]+/).map((item) => item.trim()).filter(Boolean) : [],
    description: data.summary ?? "",
    confidence: 70,
    raw
  };
}

export async function analyzePetImage(input: { imageUrl?: string; imageBase64?: string; postId?: string }) {
  if (!input.imageUrl) throw new Error("请先上传宠物照片。");
  const response = await fetch("/api/ai/analyze-pet", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ imageUrl: input.imageUrl })
  });
  const data = await response.json() as AnalyzeResponse;
  if (!response.ok || !data.success || !data.data) throw new Error(data.message || "AI 识别失败");
  return toAIInfo(data.data, data.raw);
}

export async function matchSimilarPets(postId: string, lostPets: LostPet[], foundPets: FoundPet[]) {
  const isLost = lostPets.some((pet) => pet.id === postId);
  const response = await fetch("/api/ai/match-pets", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(isLost ? { lostPetId: postId } : { foundPetId: postId })
  });
  const data = await response.json() as MatchResponse;
  if (!response.ok || !data.success) throw new Error(data.message || "AI 匹配失败");
  return {
    success: true,
    matches: data.matches ?? [],
    matchInfo: data.matchInfo
  };
}

export function getDefaultMatchableData() {
  return { lostPets: [], foundPets: [] };
}

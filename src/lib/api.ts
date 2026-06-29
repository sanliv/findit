"use client";

import type { PetMatchResult } from "@/lib/ai/types";
import { makeId, type AIPetInfo, type FoundPet, type LostPet, type PetType } from "@/lib/local-store";
import type {
  AnalyzePetResult,
  FoundPet as FoundPetRow,
  LostPet as LostPetRow,
  MatchPetPayload,
  MatchPetResult
} from "@/lib/types";

export type PostKind = "lost" | "found";
export type PetItem = { kind: "lost"; pet: LostPet } | { kind: "found"; pet: FoundPet };
export type MobilePostKind = PostKind;
export type MobileItem = PetItem;

export type MobileComment = {
  id: string;
  postId: string;
  author: string;
  content: string;
  createdAt: string;
};

export type MobileMessageType = "clue" | "chat" | "ai" | "favorite" | "system";
export type MobileMessage = {
  id: string;
  type: MobileMessageType;
  title: string;
  content: string;
  source: string;
  time: string;
  unread: boolean;
  unreadCount?: number;
  actionLabel: string;
  targetHref?: string;
  image?: string;
};

export type ProfileSummary = {
  name: string;
  verified: boolean;
  bio: string;
  avatar: string;
  stats: { posts: number; favorites: number; drafts: number; clues: number };
};

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  pet?: T;
  pets?: T;
  message?: string;
  threshold?: number;
  raw?: unknown;
  matches?: PetMatchResult[];
  matchInfo?: {
    lastMatchedAt: string;
    candidates: Array<{ postId: string; score: number; reasons: string[] }>;
  };
};

const FAVORITE_KEY = "findpet:state:favorites";
const COMMENT_KEY = "findpet:state:comments";
const MESSAGE_KEY = "findpet:state:messages";
const REMOVED_POST_KEY = "findpet:state:removed-posts";

const canStore = () => typeof window !== "undefined" && Boolean(window.localStorage);

function readJson<T>(key: string, fallback: T): T {
  if (!canStore()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (canStore()) window.localStorage.setItem(key, JSON.stringify(value));
}

export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: init?.body instanceof FormData
      ? init.headers
      : { "content-type": "application/json", ...(init?.headers ?? {}) }
  });
  const data = await response.json().catch(() => null) as T & { message?: string; success?: boolean } | null;
  if (!response.ok || data?.success === false) {
    throw new Error(`${data?.message || "接口连接失败"} (HTTP ${response.status})`);
  }
  return data as T;
}

function arr<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function one<T>(value: unknown): T | null {
  return value && typeof value === "object" ? value as T : null;
}

function text(value: unknown) {
  return String(value ?? "").trim();
}

function parseRawAI(raw?: string) {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as AIPetInfo;
  } catch {
    return undefined;
  }
}

function petTypeToSpecies(type?: string) {
  const value = text(type);
  if (/cat|猫/.test(value)) return "猫";
  if (/dog|狗|犬/.test(value)) return "狗";
  return value || "其他";
}

function speciesToPetType(species?: string | null): PetType {
  const value = text(species);
  if (/cat|猫/.test(value)) return "猫" as PetType;
  if (/dog|狗|犬/.test(value)) return "狗" as PetType;
  return "其他" as PetType;
}

function imagesFrom(url?: string | null) {
  const image = text(url);
  return image ? [image] : [];
}

function lostRowToLegacy(row: LostPetRow): LostPet {
  return {
    id: row.id,
    name: text(row.name) || text(row.breed) || "待填写",
    type: speciesToPetType(row.species),
    breed: text(row.breed) || text(row.species) || "未知",
    gender: text(row.gender) || "未知",
    age: text(row.age) || "未知",
    color: text(row.color) || "未说明",
    status: row.status === "clue" || row.status === "urgent" || row.status === "found" ? row.status : "searching",
    location: text(row.lost_location),
    lostTime: text(row.lost_time),
    lastSeenDetail: text(row.lost_location),
    traits: text(row.features) || "暂无明显特征",
    description: text(row.ai_summary),
    contactName: text(row.contact_name),
    contactPhone: text(row.contact_phone) || text(row.contact_wechat),
    reward: text(row.reward) || "未设置",
    images: imagesFrom(row.image_url),
    coordinates: { x: 52, y: 52, label: text(row.lost_location) || "位置待填写" },
    clues: [],
    createdAt: text(row.created_at) || new Date().toISOString(),
    aiInfo: parseRawAI(row.ai_raw)
  };
}

function foundRowToLegacy(row: FoundPetRow): FoundPet {
  return {
    id: row.id,
    type: speciesToPetType(row.species),
    breed: text(row.breed) || text(row.species) || "未知",
    gender: text(row.gender) || "未知",
    color: text(row.color) || "未说明",
    foundLocation: text(row.found_location),
    foundTime: text(row.found_time),
    traits: text(row.features) || "暂无明显特征",
    description: text(row.ai_summary),
    contactName: text(row.contact_name),
    contactPhone: text(row.contact_phone) || text(row.contact_wechat),
    images: imagesFrom(row.image_url),
    coordinates: { x: 52, y: 52, label: text(row.found_location) || "位置待填写" },
    status: row.status === "reunited" ? "reunited" : "waiting",
    createdAt: text(row.created_at) || new Date().toISOString(),
    aiInfo: parseRawAI(row.ai_raw)
  };
}

function lostToPayload(input: CreatePetInput) {
  return {
    name: input.name,
    species: petTypeToSpecies(input.type),
    breed: input.breed,
    gender: input.gender,
    age: input.age,
    color: input.color,
    features: input.traits,
    lost_location: input.location,
    lost_time: input.time,
    contact_name: input.contactName,
    contact_phone: input.contactPhone,
    reward: input.reward,
    image_url: input.images[0],
    ai_summary: input.aiInfo?.description,
    ai_raw: input.aiInfo,
    status: "searching"
  };
}

function foundToPayload(input: CreatePetInput) {
  return {
    species: petTypeToSpecies(input.type),
    breed: input.breed,
    gender: input.gender,
    color: input.color,
    features: input.traits,
    found_location: input.location,
    found_time: input.time,
    contact_name: input.contactName,
    contact_phone: input.contactPhone,
    image_url: input.images[0],
    ai_summary: input.aiInfo?.description,
    ai_raw: input.aiInfo,
    status: "found"
  };
}

function standardAIToLegacy(data: AnalyzePetResult, raw?: unknown): AIPetInfo {
  const petType = /猫/.test(data.species) ? "cat" : /狗|犬/.test(data.species) ? "dog" : "other";
  return {
    petType,
    breed: data.breed || "",
    color: data.color ? data.color.split(/[，、,\s]+/).filter(Boolean) : [],
    pattern: [],
    size: "",
    ageGuess: data.age || "",
    genderGuess: data.gender || "",
    features: data.features ? data.features.split(/[，、,;；]+/).map((item) => item.trim()).filter(Boolean) : [],
    description: data.summary || "",
    confidence: 70,
    raw
  };
}

export async function getLostPets(): Promise<LostPetRow[]> {
  const result = await requestJson<ApiEnvelope<LostPetRow[]>>("/api/pets");
  return arr<LostPetRow>(result.data ?? result.pets);
}

export async function getLostPet(id: string): Promise<LostPetRow | null> {
  const result = await requestJson<ApiEnvelope<LostPetRow>>(`/api/pets/${encodeURIComponent(id)}`);
  return one<LostPetRow>(result.data ?? result.pet);
}

export async function createLostPet(payload: Record<string, unknown>) {
  const result = await requestJson<ApiEnvelope<LostPetRow>>("/api/pets", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return one<LostPetRow>(result.data ?? result.pet);
}

export async function getFoundPets(): Promise<FoundPetRow[]> {
  const result = await requestJson<ApiEnvelope<FoundPetRow[]>>("/api/found-pets");
  return arr<FoundPetRow>(result.data ?? result.pets);
}

export async function getFoundPet(id: string): Promise<FoundPetRow | null> {
  const result = await requestJson<ApiEnvelope<FoundPetRow>>(`/api/found-pets/${encodeURIComponent(id)}`);
  return one<FoundPetRow>(result.data ?? result.pet);
}

export async function createFoundPet(payload: Record<string, unknown>) {
  const result = await requestJson<ApiEnvelope<FoundPetRow>>("/api/found-pets", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return one<FoundPetRow>(result.data ?? result.pet);
}

export async function uploadImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  return requestJson<{ success: true; url: string; key: string; data?: { url: string; key: string }; warning?: string }>("/api/upload", {
    method: "POST",
    body: form
  });
}

export async function analyzePet(imageUrl: string) {
  const result = await requestJson<ApiEnvelope<AnalyzePetResult>>("/api/ai/analyze-pet", {
    method: "POST",
    body: JSON.stringify({ imageUrl })
  });
  const data = one<AnalyzePetResult>(result.data);
  if (!data) throw new Error("AI 识别返回为空");
  return standardAIToLegacy(data, result.raw);
}

export async function matchPets(payload: MatchPetPayload) {
  return requestJson<ApiEnvelope<MatchPetResult[]>>("/api/ai/match-pets", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function listPets(): Promise<PetItem[]> {
  const [lostRows, foundRows] = await Promise.all([getLostPets(), getFoundPets()]);
  return [
    ...lostRows.map((row) => ({ kind: "lost" as const, pet: lostRowToLegacy(row) })),
    ...foundRows.map((row) => ({ kind: "found" as const, pet: foundRowToLegacy(row) }))
  ];
}

export async function listLostPetItems(): Promise<LostPet[]> {
  return (await getLostPets()).map(lostRowToLegacy);
}

export async function listFoundPetItems(): Promise<FoundPet[]> {
  return (await getFoundPets()).map(foundRowToLegacy);
}

export async function getLostPetItem(id: string): Promise<LostPet | null> {
  const row = await getLostPet(id);
  return row ? lostRowToLegacy(row) : null;
}

export async function getFoundPetItem(id: string): Promise<FoundPet | null> {
  const row = await getFoundPet(id);
  return row ? foundRowToLegacy(row) : null;
}

export function listPetsLocal(): PetItem[] {
  return [];
}

export async function getPet(id: string): Promise<PetItem | null> {
  try {
    const lost = await getLostPet(id);
    if (lost) return { kind: "lost", pet: lostRowToLegacy(lost) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (!message.includes("404")) throw err;
  }

  try {
    const found = await getFoundPet(id);
    if (found) return { kind: "found", pet: foundRowToLegacy(found) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (!message.includes("404")) throw err;
  }

  return null;
}

export function getPetLocal() {
  return null;
}

type CreatePetInput = {
  images: string[];
  type: PetType;
  breed: string;
  gender: string;
  color: string;
  time: string;
  location: string;
  contactName: string;
  contactPhone: string;
  description: string;
  traits: string;
  name?: string;
  age?: string;
  reward?: string;
  aiInfo?: AIPetInfo;
};

export async function createPet(kind: PostKind, input: CreatePetInput) {
  if (kind === "found") {
    const row = await createFoundPet(foundToPayload(input));
    if (!row) throw new Error("发布拾宠信息失败");
    return { kind, id: row.id, pet: foundRowToLegacy(row) };
  }

  const row = await createLostPet(lostToPayload(input));
  if (!row) throw new Error("发布走失宠物失败");
  return { kind, id: row.id, pet: lostRowToLegacy(row) };
}

export async function deletePet(_id: string) {
  throw new Error("当前版本暂未开放下架接口。");
}

export async function matchPet(postId: string) {
  const item = await getPet(postId);
  if (!item) throw new Error("没有找到对应宠物信息。");
  const result = await matchPets(item.kind === "lost" ? { lostPetId: postId } : { foundPetId: postId });
  return {
    success: true,
    matches: result.matches ?? [],
    matchInfo: result.matchInfo ?? {
      lastMatchedAt: new Date().toISOString(),
      candidates: (result.matches ?? []).map(({ postId: id, score, reasons }) => ({ postId: id, score, reasons }))
    },
    threshold: result.threshold
  };
}

export async function getMessages() {
  return requestJson<{ messages: MobileMessage[] }>("/api/messages").catch(() => {
    const cached = readJson<MobileMessage[]>(MESSAGE_KEY, []);
    return { messages: cached };
  });
}

export async function markMessageRead(id: string) {
  return requestJson("/api/messages/read", { method: "POST", body: JSON.stringify({ id }) }).catch(() => ({ success: true }));
}

export async function markAllMessagesRead() {
  return requestJson("/api/messages/read-all", { method: "POST" }).catch(() => ({ success: true }));
}

export async function deleteMessage(id: string) {
  return requestJson(`/api/messages/${id}`, { method: "DELETE" }).catch(() => ({ success: true }));
}

export async function getProfileSummary(): Promise<ProfileSummary> {
  const items = await listPets().catch(() => []);
  return {
    name: "寻宠用户",
    verified: false,
    bio: "真实数据接入中。",
    avatar: "",
    stats: {
      posts: items.length,
      favorites: getFavorites().length,
      drafts: 0,
      clues: 0
    }
  };
}

export function getRemovedPostIds() {
  return readJson<string[]>(REMOVED_POST_KEY, []);
}

export async function removeMyPet(id: string) {
  const next = Array.from(new Set([id, ...getRemovedPostIds()]));
  writeJson(REMOVED_POST_KEY, next);
  return deletePet(id);
}

export function getFavorites() {
  return readJson<string[]>(FAVORITE_KEY, []);
}

export function toggleFavorite(postId: string) {
  const current = getFavorites();
  const next = current.includes(postId) ? current.filter((id) => id !== postId) : [postId, ...current];
  writeJson(FAVORITE_KEY, next);
  return next;
}

export function getComments(postId: string) {
  return readJson<Record<string, MobileComment[]>>(COMMENT_KEY, {})[postId] ?? [];
}

export function addComment(postId: string, content: string) {
  const comments = readJson<Record<string, MobileComment[]>>(COMMENT_KEY, {});
  const comment: MobileComment = {
    id: makeId("comment"),
    postId,
    author: "热心用户",
    content,
    createdAt: new Date().toISOString()
  };
  writeJson(COMMENT_KEY, { ...comments, [postId]: [comment, ...(comments[postId] ?? [])] });
  return comment;
}

export async function geocodeAddress(address: string) {
  return requestJson("/api/map/geocode", {
    method: "POST",
    body: JSON.stringify({ address })
  });
}

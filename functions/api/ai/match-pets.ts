import {
  getFoundPet,
  getLostPet,
  listFoundPets,
  listLostPets,
  saveMatch,
  type EnvWithPetDB,
  type FoundPetRow,
  type LostPetRow
} from "../../_lib/pet-db";
import { error, json } from "../../_lib/response";

type Env = EnvWithPetDB & {
  AI_MATCH_THRESHOLD?: string;
};

type MatchInput = {
  lostPetId?: string;
  foundPetId?: string;
  pet?: Record<string, unknown>;
};

type MatchResult = {
  lost_pet_id: string;
  found_pet_id: string;
  score: number;
  reasons: string[];
};

function value(input: unknown) {
  return String(input ?? "").trim();
}

function prop(pet: LostPetRow | FoundPetRow | Record<string, unknown>, key: string) {
  return value((pet as Record<string, unknown>)[key]);
}

function speciesOf(pet: LostPetRow | FoundPetRow | Record<string, unknown>) {
  return prop(pet, "species") || prop(pet, "type");
}

function breedOf(pet: LostPetRow | FoundPetRow | Record<string, unknown>) {
  return prop(pet, "breed");
}

function colorOf(pet: LostPetRow | FoundPetRow | Record<string, unknown>) {
  return prop(pet, "color");
}

function featuresOf(pet: LostPetRow | FoundPetRow | Record<string, unknown>) {
  return prop(pet, "features") || prop(pet, "traits");
}

function locationOf(pet: LostPetRow | FoundPetRow | Record<string, unknown>) {
  return prop(pet, "lost_location") || prop(pet, "found_location") || prop(pet, "location");
}

function timeOf(pet: LostPetRow | FoundPetRow | Record<string, unknown>) {
  return prop(pet, "lost_time") || prop(pet, "found_time") || prop(pet, "time");
}

function tokens(text: string) {
  return Array.from(new Set(text.split(/[\s,，、;；。.!！?？()（）/\\-]+/).map((item) => item.trim()).filter((item) => item.length >= 2)));
}

function hasOverlap(left: string, right: string) {
  if (!left || !right) return false;
  if (left.includes(right) || right.includes(left)) return true;
  const rightTokens = tokens(right).join(" ");
  return tokens(left).some((token) => rightTokens.includes(token));
}

function timeClose(left: string, right: string) {
  const leftDate = Date.parse(left.replace(" ", "T"));
  const rightDate = Date.parse(right.replace(" ", "T"));
  if (Number.isFinite(leftDate) && Number.isFinite(rightDate)) {
    return Math.abs(leftDate - rightDate) <= 1000 * 60 * 60 * 24 * 7;
  }
  return Boolean(left && right);
}

function scorePair(lost: LostPetRow, found: FoundPetRow): MatchResult {
  let score = 0;
  const reasons: string[] = [];

  if (speciesOf(lost) && speciesOf(lost) === speciesOf(found)) {
    score += 30;
    reasons.push("物种相同");
  }

  if (hasOverlap(breedOf(lost), breedOf(found))) {
    score += 15;
    reasons.push("品种相似");
  }

  if (hasOverlap(colorOf(lost), colorOf(found))) {
    score += 20;
    reasons.push("颜色相似");
  }

  if (hasOverlap(featuresOf(lost), featuresOf(found))) {
    score += 15;
    reasons.push("明显特征相似");
  }

  if (hasOverlap(locationOf(lost), locationOf(found))) {
    score += 10;
    reasons.push("地点文本相近");
  }

  if (timeClose(timeOf(lost), timeOf(found))) {
    score += 10;
    reasons.push("时间接近");
  }

  return {
    lost_pet_id: lost.id,
    found_pet_id: found.id,
    score: Math.min(100, score),
    reasons
  };
}

function foundToMatchable(found: FoundPetRow) {
  return {
    id: found.id,
    kind: "found",
    type: found.species ?? "",
    breed: found.breed ?? "",
    gender: found.gender ?? "",
    age: found.age ?? "",
    color: found.color ?? "",
    status: found.status ?? "found",
    location: found.found_location ?? "",
    time: found.found_time ?? "",
    traits: found.features ?? "",
    description: found.ai_summary ?? "",
    images: found.image_url ? [found.image_url] : []
  };
}

function lostToMatchable(lost: LostPetRow) {
  return {
    id: lost.id,
    kind: "lost",
    name: lost.name ?? "",
    type: lost.species ?? "",
    breed: lost.breed ?? "",
    gender: lost.gender ?? "",
    age: lost.age ?? "",
    color: lost.color ?? "",
    status: lost.status ?? "searching",
    location: lost.lost_location ?? "",
    time: lost.lost_time ?? "",
    traits: lost.features ?? "",
    description: lost.ai_summary ?? "",
    images: lost.image_url ? [lost.image_url] : []
  };
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    const body = await request.json() as MatchInput;
    const threshold = Number(env.AI_MATCH_THRESHOLD || "70");
    const minScore = Number.isFinite(threshold) ? threshold : 70;
    const lostPets = await listLostPets(env.DB);
    const foundPets = await listFoundPets(env.DB);

    let pairs: MatchResult[] = [];
    if (body.lostPetId && body.foundPetId) {
      const [lost, found] = await Promise.all([getLostPet(env.DB, body.lostPetId), getFoundPet(env.DB, body.foundPetId)]);
      if (!lost || !found) return error("没有找到指定的宠物信息。", 404);
      pairs = [scorePair(lost, found)];
    } else if (body.lostPetId) {
      const lost = await getLostPet(env.DB, body.lostPetId);
      if (!lost) return error("没有找到指定的走失宠物信息。", 404);
      pairs = foundPets.map((found) => scorePair(lost, found));
    } else if (body.foundPetId) {
      const found = await getFoundPet(env.DB, body.foundPetId);
      if (!found) return error("没有找到指定的拾宠信息。", 404);
      pairs = lostPets.map((lost) => scorePair(lost, found));
    } else if (body.pet) {
      if (value(body.pet.kind) === "found") {
        const found = { ...body.pet, id: value(body.pet.id) || "input-found" } as FoundPetRow;
        pairs = lostPets.map((lost) => scorePair(lost, found));
      } else {
        const lost = { ...body.pet, id: value(body.pet.id) || "input-lost" } as LostPetRow;
        pairs = foundPets.map((found) => scorePair(lost, found));
      }
    } else {
      pairs = lostPets.flatMap((lost) => foundPets.map((found) => scorePair(lost, found)));
    }

    const data = pairs
      .filter((item) => item.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    await Promise.all(data.slice(0, 10).map((item) => saveMatch(env.DB, item).catch(() => null)));

    const foundById = new Map(foundPets.map((pet) => [pet.id, pet]));
    const lostById = new Map(lostPets.map((pet) => [pet.id, pet]));
    const matches = data.map((item) => {
      const pet = body.foundPetId ? lostById.get(item.lost_pet_id) : foundById.get(item.found_pet_id);
      return {
        postId: body.foundPetId ? item.lost_pet_id : item.found_pet_id,
        score: item.score,
        reasons: item.reasons,
        pet: pet && "found_location" in pet ? foundToMatchable(pet as FoundPetRow) : pet ? lostToMatchable(pet as LostPetRow) : undefined
      };
    }).filter((item) => item.pet);

    return json({
      success: true,
      threshold: minScore,
      data,
      matches,
      matchInfo: {
        lastMatchedAt: new Date().toISOString(),
        candidates: matches.map(({ postId, score, reasons }) => ({ postId, score, reasons }))
      }
    });
  } catch (err) {
    return error(err instanceof Error ? err.message : "AI 匹配失败，请稍后再试。", 500);
  }
}

export function onRequestGet() {
  return json({ success: false, message: "请使用 POST 调用 AI 匹配接口。" }, 405);
}

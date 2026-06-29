import { createFoundPet, foundFromInput, listFoundPets, type EnvWithPetDB } from "../_lib/pet-db";
import { error, json } from "../_lib/response";

type Context = {
  request: Request;
  env: EnvWithPetDB;
};

export async function onRequestGet({ env }: Context) {
  try {
    const rows = await listFoundPets(env.DB);
    return json({ success: true, data: rows, pets: rows });
  } catch (err) {
    return error(err instanceof Error ? err.message : "读取拾宠信息失败。", 500);
  }
}

export async function onRequestPost({ request, env }: Context) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const pet = foundFromInput(body.pet && typeof body.pet === "object" ? body.pet as Record<string, unknown> : body);
    const saved = await createFoundPet(env.DB, pet);
    return json({ success: true, data: saved, pet: saved }, 201);
  } catch (err) {
    return error(err instanceof Error ? err.message : "发布拾宠信息失败，请稍后再试。", 400);
  }
}

export function onRequestOptions() {
  return json({ success: true });
}

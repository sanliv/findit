import { getLostPet, type EnvWithPetDB } from "../../_lib/pet-db";
import { error, json } from "../../_lib/response";

type Context = {
  env: EnvWithPetDB;
  params: { id: string };
};

export async function onRequestGet({ env, params }: Context) {
  try {
    const pet = await getLostPet(env.DB, params.id);
    if (!pet) return error("没有找到这条走失宠物信息。", 404);
    return json({ success: true, data: pet, pet });
  } catch (err) {
    return error(err instanceof Error ? err.message : "读取走失宠物详情失败。", 500);
  }
}

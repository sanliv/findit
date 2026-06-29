export type D1Result<T> = {
  results?: T[];
  success?: boolean;
};

export type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = unknown>(): Promise<D1Result<T>>;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<unknown>;
};

export type D1DatabaseLike = {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<unknown>;
};

export type EnvWithPetDB = {
  DB?: D1DatabaseLike;
};

export type LostPetRow = {
  id: string;
  name?: string | null;
  species?: string | null;
  breed?: string | null;
  gender?: string | null;
  age?: string | null;
  color?: string | null;
  features?: string | null;
  collar?: string | null;
  lost_location?: string | null;
  lost_time?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_wechat?: string | null;
  reward?: string | null;
  image_url?: string | null;
  ai_summary?: string | null;
  ai_raw?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type FoundPetRow = {
  id: string;
  species?: string | null;
  breed?: string | null;
  gender?: string | null;
  age?: string | null;
  color?: string | null;
  features?: string | null;
  collar?: string | null;
  found_location?: string | null;
  found_time?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_wechat?: string | null;
  image_url?: string | null;
  ai_summary?: string | null;
  ai_raw?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

let initialized = false;

export async function ensurePetTables(db?: D1DatabaseLike) {
  if (!db || initialized) return;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS lost_pets (
      id TEXT PRIMARY KEY,
      name TEXT,
      species TEXT,
      breed TEXT,
      gender TEXT,
      age TEXT,
      color TEXT,
      features TEXT,
      collar TEXT,
      lost_location TEXT,
      lost_time TEXT,
      contact_name TEXT,
      contact_phone TEXT,
      contact_wechat TEXT,
      reward TEXT,
      image_url TEXT,
      ai_summary TEXT,
      ai_raw TEXT,
      status TEXT DEFAULT 'searching',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS found_pets (
      id TEXT PRIMARY KEY,
      species TEXT,
      breed TEXT,
      gender TEXT,
      age TEXT,
      color TEXT,
      features TEXT,
      collar TEXT,
      found_location TEXT,
      found_time TEXT,
      contact_name TEXT,
      contact_phone TEXT,
      contact_wechat TEXT,
      image_url TEXT,
      ai_summary TEXT,
      ai_raw TEXT,
      status TEXT DEFAULT 'found',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      lost_pet_id TEXT,
      found_pet_id TEXT,
      score INTEGER,
      reasons TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_lost_pets_created_at ON lost_pets(created_at);
    CREATE INDEX IF NOT EXISTS idx_found_pets_created_at ON found_pets(created_at);
    CREATE INDEX IF NOT EXISTS idx_matches_lost_pet_id ON matches(lost_pet_id);
    CREATE INDEX IF NOT EXISTS idx_matches_found_pet_id ON matches(found_pet_id);
  `);
  initialized = true;
}

export function requireDB(db?: D1DatabaseLike) {
  if (!db) throw new Error("D1 数据库未绑定，请在 Cloudflare Pages 中绑定名称 DB。");
  return db;
}

function text(value: unknown) {
  if (value === undefined || value === null) return null;
  const output = String(value).trim();
  return output || null;
}

function jsonText(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  return typeof value === "string" ? value : JSON.stringify(value);
}

function firstImage(value: unknown) {
  if (Array.isArray(value)) return text(value[0]);
  return text(value);
}

export function lostFromInput(input: Record<string, unknown>): LostPetRow {
  const now = new Date().toISOString();
  return {
    id: text(input.id) ?? crypto.randomUUID(),
    name: text(input.name),
    species: text(input.species ?? input.type),
    breed: text(input.breed),
    gender: text(input.gender),
    age: text(input.age),
    color: text(input.color),
    features: text(input.features ?? input.traits),
    collar: text(input.collar),
    lost_location: text(input.lost_location ?? input.location),
    lost_time: text(input.lost_time ?? input.lostTime ?? input.time),
    contact_name: text(input.contact_name ?? input.contactName),
    contact_phone: text(input.contact_phone ?? input.contactPhone),
    contact_wechat: text(input.contact_wechat ?? input.contactWechat),
    reward: text(input.reward),
    image_url: firstImage(input.image_url ?? input.images),
    ai_summary: text(input.ai_summary ?? input.aiInfoSummary),
    ai_raw: jsonText(input.ai_raw ?? input.aiInfo),
    status: text(input.status) ?? "searching",
    created_at: text(input.created_at ?? input.createdAt) ?? now,
    updated_at: now
  };
}

export function foundFromInput(input: Record<string, unknown>): FoundPetRow {
  const now = new Date().toISOString();
  return {
    id: text(input.id) ?? crypto.randomUUID(),
    species: text(input.species ?? input.type),
    breed: text(input.breed),
    gender: text(input.gender),
    age: text(input.age),
    color: text(input.color),
    features: text(input.features ?? input.traits),
    collar: text(input.collar),
    found_location: text(input.found_location ?? input.foundLocation ?? input.location),
    found_time: text(input.found_time ?? input.foundTime ?? input.time),
    contact_name: text(input.contact_name ?? input.contactName),
    contact_phone: text(input.contact_phone ?? input.contactPhone),
    contact_wechat: text(input.contact_wechat ?? input.contactWechat),
    image_url: firstImage(input.image_url ?? input.images),
    ai_summary: text(input.ai_summary ?? input.aiInfoSummary),
    ai_raw: jsonText(input.ai_raw ?? input.aiInfo),
    status: text(input.status) ?? "found",
    created_at: text(input.created_at ?? input.createdAt) ?? now,
    updated_at: now
  };
}

export async function listLostPets(db?: D1DatabaseLike) {
  const ready = requireDB(db);
  await ensurePetTables(ready);
  const rows = await ready.prepare("SELECT * FROM lost_pets ORDER BY created_at DESC").all<LostPetRow>();
  return rows.results ?? [];
}

export async function getLostPet(db: D1DatabaseLike | undefined, id: string) {
  const ready = requireDB(db);
  await ensurePetTables(ready);
  return ready.prepare("SELECT * FROM lost_pets WHERE id = ?").bind(id).first<LostPetRow>();
}

export async function createLostPet(db: D1DatabaseLike | undefined, pet: LostPetRow) {
  const ready = requireDB(db);
  await ensurePetTables(ready);
  await ready.prepare(`
    INSERT INTO lost_pets (
      id, name, species, breed, gender, age, color, features, collar,
      lost_location, lost_time, contact_name, contact_phone, contact_wechat,
      reward, image_url, ai_summary, ai_raw, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    pet.id, pet.name, pet.species, pet.breed, pet.gender, pet.age, pet.color, pet.features, pet.collar,
    pet.lost_location, pet.lost_time, pet.contact_name, pet.contact_phone, pet.contact_wechat,
    pet.reward, pet.image_url, pet.ai_summary, pet.ai_raw, pet.status, pet.created_at, pet.updated_at
  ).run();
  return pet;
}

export async function listFoundPets(db?: D1DatabaseLike) {
  const ready = requireDB(db);
  await ensurePetTables(ready);
  const rows = await ready.prepare("SELECT * FROM found_pets ORDER BY created_at DESC").all<FoundPetRow>();
  return rows.results ?? [];
}

export async function getFoundPet(db: D1DatabaseLike | undefined, id: string) {
  const ready = requireDB(db);
  await ensurePetTables(ready);
  return ready.prepare("SELECT * FROM found_pets WHERE id = ?").bind(id).first<FoundPetRow>();
}

export async function createFoundPet(db: D1DatabaseLike | undefined, pet: FoundPetRow) {
  const ready = requireDB(db);
  await ensurePetTables(ready);
  await ready.prepare(`
    INSERT INTO found_pets (
      id, species, breed, gender, age, color, features, collar,
      found_location, found_time, contact_name, contact_phone, contact_wechat,
      image_url, ai_summary, ai_raw, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    pet.id, pet.species, pet.breed, pet.gender, pet.age, pet.color, pet.features, pet.collar,
    pet.found_location, pet.found_time, pet.contact_name, pet.contact_phone, pet.contact_wechat,
    pet.image_url, pet.ai_summary, pet.ai_raw, pet.status, pet.created_at, pet.updated_at
  ).run();
  return pet;
}

export async function saveMatch(db: D1DatabaseLike | undefined, input: { lost_pet_id: string; found_pet_id: string; score: number; reasons: string[] }) {
  if (!db) return null;
  await ensurePetTables(db);
  const row = {
    id: crypto.randomUUID(),
    lost_pet_id: input.lost_pet_id,
    found_pet_id: input.found_pet_id,
    score: input.score,
    reasons: JSON.stringify(input.reasons),
    created_at: new Date().toISOString()
  };
  await db.prepare("INSERT INTO matches (id, lost_pet_id, found_pet_id, score, reasons, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(row.id, row.lost_pet_id, row.found_pet_id, row.score, row.reasons, row.created_at)
    .run();
  return row;
}

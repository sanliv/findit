type D1Result<T> = {
  results?: T[];
  success?: boolean;
};

type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = unknown>(): Promise<D1Result<T>>;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<unknown>;
};

export type D1DatabaseLike = {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<unknown>;
};

export type StoredPet = {
  id: string;
  kind: "lost" | "found";
  [key: string]: unknown;
};

export type EnvWithDB = {
  DB?: D1DatabaseLike;
};

let initialized = false;

export async function ensurePetSchema(db?: D1DatabaseLike) {
  if (!db || initialized) return;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS pets (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      removed INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_pets_kind ON pets(kind);
    CREATE INDEX IF NOT EXISTS idx_pets_removed ON pets(removed);
  `);
  initialized = true;
}

export async function listPetsFromDB(db?: D1DatabaseLike): Promise<StoredPet[] | null> {
  if (!db) return null;
  await ensurePetSchema(db);
  const rows = await db.prepare("SELECT id, kind, data FROM pets WHERE removed = 0 ORDER BY created_at DESC").all<{ id: string; kind: "lost" | "found"; data: string }>();
  return (rows.results ?? []).map((row) => ({ id: row.id, kind: row.kind, ...JSON.parse(row.data) }));
}

export async function getPetFromDB(db: D1DatabaseLike | undefined, id: string): Promise<StoredPet | null> {
  if (!db) return null;
  await ensurePetSchema(db);
  const row = await db.prepare("SELECT id, kind, data FROM pets WHERE id = ? AND removed = 0").bind(id).first<{ id: string; kind: "lost" | "found"; data: string }>();
  return row ? { id: row.id, kind: row.kind, ...JSON.parse(row.data) } : null;
}

export async function savePetToDB(db: D1DatabaseLike | undefined, pet: StoredPet): Promise<StoredPet | null> {
  if (!db) return null;
  await ensurePetSchema(db);
  const now = new Date().toISOString();
  const id = pet.id;
  const kind = pet.kind;
  const data = JSON.stringify(pet);
  await db
    .prepare(`
      INSERT INTO pets (id, kind, data, created_at, updated_at, removed)
      VALUES (?, ?, ?, ?, ?, 0)
      ON CONFLICT(id) DO UPDATE SET
        kind = excluded.kind,
        data = excluded.data,
        updated_at = excluded.updated_at,
        removed = 0
    `)
    .bind(id, kind, data, pet.createdAt || now, now)
    .run();
  return pet;
}

export async function removePetFromDB(db: D1DatabaseLike | undefined, id: string) {
  if (!db) return false;
  await ensurePetSchema(db);
  await db.prepare("UPDATE pets SET removed = 1, updated_at = ? WHERE id = ?").bind(new Date().toISOString(), id).run();
  return true;
}

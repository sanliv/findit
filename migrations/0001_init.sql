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

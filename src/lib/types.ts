export type LostPet = {
  id: string;
  name?: string;
  species?: string;
  breed?: string;
  gender?: string;
  age?: string;
  color?: string;
  features?: string;
  collar?: string;
  lost_location?: string;
  lost_time?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_wechat?: string;
  reward?: string;
  image_url?: string;
  ai_summary?: string;
  ai_raw?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

export type FoundPet = {
  id: string;
  species?: string;
  breed?: string;
  gender?: string;
  age?: string;
  color?: string;
  features?: string;
  collar?: string;
  found_location?: string;
  found_time?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_wechat?: string;
  image_url?: string;
  ai_summary?: string;
  ai_raw?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

export type MatchPetPayload = {
  lostPetId?: string;
  foundPetId?: string;
  pet?: Record<string, unknown>;
};

export type MatchPetResult = {
  lost_pet_id: string;
  found_pet_id: string;
  score: number;
  reasons: string[];
};

export type AnalyzePetResult = {
  species: string;
  breed: string;
  color: string;
  age: string;
  gender: string;
  features: string;
  collar: string;
  summary: string;
};

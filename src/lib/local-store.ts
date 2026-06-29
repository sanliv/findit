"use client";

import type { AIPetInfo, AIMatchInfo, FoundPet, Pet, PetStatus, PetType } from "@/data/pets";

export type { AIPetInfo, AIMatchInfo, FoundPet, PetStatus, PetType };

export type Clue = {
  id: string;
  petId: string;
  finderName: string;
  finderContact: string;
  seenTime: string;
  seenLocation: string;
  message: string;
  image: string;
  createdAt: string;
};

export type LostPet = Omit<Pet, "clues"> & {
  clues: Clue[];
};

const LOST_KEY = "findpet:lost-pets";
const FOUND_KEY = "findpet:found-pets";
const FOUND_CLAIMS_KEY = "findpet:found-pet-claims";

export type ClaimRequest = {
  id: string;
  foundPetId: string;
  name: string;
  contact: string;
  proofDescription: string;
  proofImages: string[];
  message: string;
  createdAt: string;
};

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const read = <T,>(key: string, fallback: T): T => {
  if (!canUseStorage()) return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
};

const write = <T,>(key: string, value: T) => {
  if (canUseStorage()) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
};

export function getLostPets(): LostPet[] {
  return read<LostPet[]>(LOST_KEY, []);
}

export function addLostPet(pet: LostPet) {
  const pets = getLostPets();
  write(LOST_KEY, [pet, ...pets]);
}

export function getLostPetById(id: string) {
  return getLostPets().find((pet) => pet.id === id);
}

export function addClue(petId: string, clue: Clue) {
  const pets = getLostPets().map((pet) => {
    if (pet.id !== petId) return pet;
    const nextStatus: PetStatus = pet.status === "searching" ? "clue" : pet.status;
    return { ...pet, status: nextStatus, clues: [clue, ...pet.clues] };
  });
  write(LOST_KEY, pets);
}

export function updateLostPetAI(petId: string, aiInfo: AIPetInfo) {
  write(LOST_KEY, getLostPets().map((pet) => (pet.id === petId ? { ...pet, aiInfo } : pet)));
}

export function updateLostPetMatches(petId: string, matchInfo: AIMatchInfo) {
  write(LOST_KEY, getLostPets().map((pet) => (pet.id === petId ? { ...pet, matchInfo } : pet)));
}

export function getFoundPets(): FoundPet[] {
  return read<FoundPet[]>(FOUND_KEY, []);
}

export function getFoundPetById(id: string) {
  return getFoundPets().find((pet) => pet.id === id);
}

export function addFoundPet(foundPet: FoundPet) {
  const pets = getFoundPets();
  write(FOUND_KEY, [foundPet, ...pets]);
}

export function updateFoundPetAI(foundPetId: string, aiInfo: AIPetInfo) {
  write(FOUND_KEY, getFoundPets().map((pet) => (pet.id === foundPetId ? { ...pet, aiInfo } : pet)));
}

export function updateFoundPetMatches(foundPetId: string, matchInfo: AIMatchInfo) {
  write(FOUND_KEY, getFoundPets().map((pet) => (pet.id === foundPetId ? { ...pet, matchInfo } : pet)));
}

export function getFoundPetClaims(foundPetId: string): ClaimRequest[] {
  const claims = read<Record<string, ClaimRequest[]>>(FOUND_CLAIMS_KEY, {});
  return claims[foundPetId] ?? [];
}

export function addFoundPetClaim(foundPetId: string, claim: ClaimRequest) {
  const claims = read<Record<string, ClaimRequest[]>>(FOUND_CLAIMS_KEY, {});
  write(FOUND_CLAIMS_KEY, {
    ...claims,
    [foundPetId]: [claim, ...(claims[foundPetId] ?? [])]
  });
}

export function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

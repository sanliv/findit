"use client";

import { ChevronRight, Settings } from "lucide-react";
import { SafePetImage } from "@/components/SafePetImage";
import type { ProfileSummary } from "@/lib/mobile-api";

export function ProfileHeader({ profile, onEdit, onVerify, onSettings }: { profile: ProfileSummary; onEdit: () => void; onVerify: () => void; onSettings: () => void }) {
  return (
    <section className="rounded-3xl bg-white p-4 shadow-[0_8px_22px_rgba(31,50,69,.05)]">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onEdit} className="flex min-w-0 flex-1 items-center gap-4 text-left">
          <SafePetImage src={profile.avatar} alt="头像" className="h-[72px] w-[72px] shrink-0 rounded-full" />
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span className="truncate text-2xl font-black text-[#111827]">{profile.name}</span>
              <button type="button" onClick={(event) => { event.stopPropagation(); onVerify(); }} className="rounded-full bg-[var(--color-primary-light)] px-2 py-1 text-xs font-bold text-[var(--color-primary-dark)]">
                {profile.verified ? "已认证" : "去认证"}
              </button>
            </span>
            <span className="mt-2 block text-sm leading-5 text-[#667085]">{profile.bio}</span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-[#94a3b8]" />
        </button>
        <button type="button" onClick={onSettings} className="ml-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f7f9]"><Settings className="h-6 w-6" /></button>
      </div>
    </section>
  );
}

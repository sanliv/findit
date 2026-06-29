"use client";

import { FileText, MessageCircle, Send, Star } from "lucide-react";
import type { ProfileSummary } from "@/lib/mobile-api";

export function ProfileStats({ stats, onSelect }: { stats: ProfileSummary["stats"]; onSelect: (key: string) => void }) {
  const items = [
    { key: "posts", label: "我的发布", value: stats.posts, icon: Send },
    { key: "favorites", label: "我的收藏", value: stats.favorites, icon: Star },
    { key: "drafts", label: "草稿箱", value: stats.drafts, icon: FileText },
    { key: "clues", label: "线索反馈", value: stats.clues, icon: MessageCircle }
  ];
  return (
    <section className="grid grid-cols-4 rounded-3xl bg-white p-3 shadow-[0_8px_22px_rgba(31,50,69,.05)]">
      {items.map((item) => (
        <button key={item.key} type="button" onClick={() => onSelect(item.key)} className="border-r border-[#e5eaf0] p-2 text-center last:border-r-0 active:bg-[var(--color-primary-soft)]">
          <item.icon className="mx-auto h-6 w-6 text-[var(--color-primary-dark)]" />
          <p className="mt-2 text-lg font-black">{item.value}</p>
          <p className="text-xs text-[#667085]">{item.label}</p>
        </button>
      ))}
    </section>
  );
}

"use client";

import { Bell, Bot, ChevronRight, MessageCircle, MoreHorizontal, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SafePetImage } from "@/components/SafePetImage";
import type { MobileMessage } from "@/lib/mobile-api";

const icons = {
  clue: Search,
  chat: MessageCircle,
  ai: Bot,
  favorite: Star,
  system: Bell
};

export function MessageCard({
  message,
  onOpen,
  onAction,
  onMore
}: {
  message: MobileMessage;
  onOpen: () => void;
  onAction: () => void;
  onMore: () => void;
}) {
  const Icon = icons[message.type];
  return (
    <article className="rounded-3xl border border-[#ffd2b3] bg-white p-4 shadow-[0_8px_22px_rgba(31,50,69,.05)]">
      <button type="button" onClick={onOpen} className="grid w-full grid-cols-[52px_1fr_28px] gap-3 text-left">
        {message.image ? (
          <SafePetImage src={message.image} alt={message.title} className="h-14 w-14 rounded-2xl" />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]"><Icon className="h-6 w-6" /></span>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-black text-[#111827]">{message.title}</h3>
            {message.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--color-lost)]" />}
          </div>
          <p className="mt-1 truncate text-sm text-[#4b5563]">{message.content}</p>
          <p className="mt-1 text-xs text-[#7a8490]">{message.source} 路 {message.time}</p>
        </div>
        <ChevronRight className="mt-4 h-5 w-5 text-[#9ca3af]" />
      </button>
      <div className="mt-3 flex items-center justify-between border-t border-[#fff0e5] pt-3">
        <Button type="button" variant="outline" size="sm" className="h-9 rounded-xl text-[var(--color-primary-dark)]" onClick={onAction}>{message.actionLabel}</Button>
        <button type="button" onClick={onMore} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff8f1] text-[#667085]"><MoreHorizontal className="h-5 w-5" /></button>
      </div>
    </article>
  );
}

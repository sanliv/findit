"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MessageCircle, PlusCircle, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { getMessages } from "@/lib/mobile-api";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "发现", icon: Compass },
  { href: "/post", label: "发布", icon: PlusCircle },
  { href: "/messages", label: "消息", icon: MessageCircle },
  { href: "/profile", label: "我的", icon: UserRound }
];

export function BottomNav() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getMessages()
      .then((result) => setUnreadCount(result.messages.filter((message) => message.unread).length))
      .catch(() => setUnreadCount(0));
  }, [pathname]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--color-primary-border)]/50 bg-white/95 px-5 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 shadow-[0_-8px_24px_rgba(31,50,69,.08)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-h-12 flex-col items-center justify-center gap-1 text-xs font-semibold text-[#6b7280]",
                active && "text-[var(--color-primary-dark)]"
              )}
            >
              <span className={cn("relative flex h-7 w-7 items-center justify-center rounded-full", active && "bg-[var(--color-primary)] text-white")}>
                <item.icon className="h-5 w-5" />
              </span>
              {item.href === "/messages" && unreadCount > 0 && (
                <span className="absolute right-7 top-0 rounded-full bg-[var(--color-lost)] px-1.5 text-[10px] font-black text-white">{unreadCount}</span>
              )}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PawPrint, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "首页" },
  { href: "/nearby", label: "附近宠物" },
  { href: "/found", label: "捡到宠物" },
  { href: "/success", label: "成功找回" },
  { href: "/login", label: "登录" }
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-[#eadfd3] bg-white/95 shadow-[0_2px_12px_rgba(48,28,8,.08)] backdrop-blur">
      <div className="container-page flex h-[76px] items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white">
            <PawPrint className="h-7 w-7" fill="currentColor" />
          </span>
          <span className="text-3xl font-black tracking-normal text-primary">寻它</span>
          <span className="text-2xl font-semibold text-[#3b3835]">FindPet</span>
        </Link>
        <nav className="hidden items-center gap-8 text-lg font-bold md:flex">
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={cn("relative py-7", active && "text-primary")}>
                {item.label}
                {active && <span className="absolute bottom-0 left-1/2 h-[3px] w-14 -translate-x-1/2 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>
        <Link href="/post">
          <Button className="rounded-2xl px-6 text-base">
            <Send className="h-5 w-5" fill="currentColor" />
            发布寻宠
          </Button>
        </Link>
      </div>
    </header>
  );
}

"use client";

import { Clock, FileText, Headphones, History, Lock, PawPrint, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { ProfileMenuItem } from "@/components/mobile/ProfileMenuItem";

const menu = [
  { key: "lost", icon: PawPrint, title: "我的寻宠", desc: "已发布 5 条" },
  { key: "found", icon: ShieldCheck, title: "我的待领养", desc: "已发布 3 条" },
  { key: "ai", icon: Sparkles, title: "AI匹配记录", desc: "为你推荐的线索" },
  { key: "history", icon: History, title: "浏览历史", desc: "最近浏览 20 条" },
  { key: "service", icon: Headphones, title: "联系客服", desc: "7×12 小时在线" },
  { key: "privacy", icon: Lock, title: "隐私设置", desc: "" },
  { key: "agreement", icon: FileText, title: "用户协议", desc: "" },
  { key: "about", icon: UserRound, title: "关于我们", desc: "" },
  { key: "clock", icon: Clock, title: "提醒设置", desc: "" }
];

export function ProfileMenuList({ onSelect }: { onSelect: (key: string, title: string) => void }) {
  return (
    <section className="rounded-3xl bg-white p-4 shadow-[0_8px_22px_rgba(31,50,69,.05)]">
      {menu.slice(0, 5).map((item) => <ProfileMenuItem key={item.key} icon={item.icon} title={item.title} desc={item.desc} onClick={() => onSelect(item.key, item.title)} />)}
      <div className="my-2 border-t border-[#FFD2B3]/70" />
      {menu.slice(5).map((item) => <ProfileMenuItem key={item.key} icon={item.icon} title={item.title} desc={item.desc} onClick={() => onSelect(item.key, item.title)} />)}
    </section>
  );
}

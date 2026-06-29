"use client";

import { LogOut, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BottomNav } from "@/components/mobile/BottomNav";
import { ConfirmDialog } from "@/components/mobile/ConfirmDialog";
import { MyPostCard } from "@/components/mobile/MyPostCard";
import { ProfileHeader } from "@/components/mobile/ProfileHeader";
import { ProfileMenuList } from "@/components/mobile/ProfileMenuList";
import { ProfileStats } from "@/components/mobile/ProfileStats";
import { EmptyState, LoadingState } from "@/components/mobile/States";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getAllMobilePets, getAllMobilePetsRemote, getProfileSummary, getRemovedPostIds, removeMyPet, type ProfileSummary } from "@/lib/mobile-api";
import type { FoundPet, LostPet } from "@/lib/local-store";

type MobileItem = { kind: "lost"; pet: LostPet } | { kind: "found"; pet: FoundPet };

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [items, setItems] = useState<MobileItem[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [infoDialog, setInfoDialog] = useState<{ title: string; content: string } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<MobileItem | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const summary = await getProfileSummary();
    setProfile(summary);
    setItems((await getAllMobilePetsRemote().catch(() => getAllMobilePets())).slice(0, 8));
    setRemovedIds(getRemovedPostIds());
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const visibleItems = useMemo(() => items.slice(0, 4), [items]);
  const explain = (title: string, content = "当前为本地 mock fallback 演示。接入真实接口后，这里会跳转到对应管理页面。") => setInfoDialog({ title, content });

  const removePost = async () => {
    if (!removeTarget) return;
    await removeMyPet(removeTarget.pet.id);
    setRemovedIds(getRemovedPostIds());
    setRemoveTarget(null);
    toast.success("已下架，状态已更新");
  };

  const runMatch = (item: MobileItem) => {
    window.location.href = item.kind === "lost" ? `/pet-detail/?id=${encodeURIComponent(item.pet.id)}` : `/found-detail/?id=${encodeURIComponent(item.pet.id)}`;
  };

  return (
    <div className="min-h-screen bg-[#fff8f1] pb-[calc(88px+env(safe-area-inset-bottom))]">
      <main className="mx-auto max-w-md space-y-4 px-4 pb-6 pt-5">
        <header className="flex items-center justify-center">
          <h1 className="text-2xl font-black">我的</h1>
        </header>

        {loading || !profile ? (
          <LoadingState text="正在加载个人中心..." />
        ) : (
          <>
            <ProfileHeader
              profile={profile}
              onEdit={() => explain("编辑个人资料", "可以修改头像、昵称和个人说明。当前为本地 mock 演示。")}
              onVerify={() => explain("实名认证", "认证后发布信息会显示认证标签，提高可信度。")}
              onSettings={() => explain("设置", "这里将进入账号设置、通知设置和隐私设置。")}
            />
            <ProfileStats stats={profile.stats} onSelect={(key) => explain({
              posts: "我的发布",
              favorites: "我的收藏",
              drafts: "草稿箱",
              clues: "线索反馈"
            }[key] ?? "入口")} />
          </>
        )}

        <ProfileMenuList onSelect={(key, title) => {
          if (key === "lost" || key === "found") explain(title, "这里会筛选展示对应类型的发布信息。");
          else if (key === "service") explain("联系客服", "客服入口已准备，后续可接入在线客服或电话。");
          else explain(title);
        }} />

        <section className="rounded-3xl bg-white p-4 shadow-card">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-black">我发布的（{visibleItems.length}）</h2>
            <button type="button" onClick={() => explain("我的发布", "这里展示你发布过的寻宠和待领养信息。")} className="text-sm font-bold text-[var(--color-primary)]">全部</button>
          </div>
          <div>
            {visibleItems.length ? visibleItems.map((item) => (
              <MyPostCard
                key={item.pet.id}
                item={{ ...item, removed: removedIds.includes(item.pet.id) }}
                onEdit={() => { window.location.href = `/post?edit=${encodeURIComponent(item.pet.id)}`; }}
                onRemove={() => setRemoveTarget(item)}
                onMatch={() => runMatch(item)}
              />
            )) : <EmptyState title="还没有发布" description="发布寻宠或待领养信息后，会在这里统一管理。" />}
          </div>
        </section>

        <button type="button" onClick={() => setLogoutOpen(true)} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-bold text-[#666]">
          <LogOut className="h-4 w-4" />退出登录
        </button>

        <a href="/post"><Button className="h-14 w-full rounded-3xl bg-[var(--color-primary)] text-lg hover:bg-[var(--color-primary-dark)]"><Plus className="h-6 w-6" />发布新信息</Button></a>
      </main>
      <BottomNav />

      <ConfirmDialog
        open={!!removeTarget}
        title="确认下架这条信息吗？"
        description="下架后，这条信息会在我的发布中显示为已下架。当前版本使用 mock fallback 保存状态。"
        confirmText="确认下架"
        danger
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        onConfirm={removePost}
      />
      <ConfirmDialog
        open={logoutOpen}
        title="确认退出当前账号吗？"
        description="退出后本地演示数据仍会保留，重新进入可继续查看。"
        confirmText="退出登录"
        danger
        onOpenChange={setLogoutOpen}
        onConfirm={() => { setLogoutOpen(false); toast.success("已退出登录（mock）"); }}
      />
      <Dialog open={!!infoDialog} onOpenChange={(open) => !open && setInfoDialog(null)}>
        <DialogContent className="max-w-[calc(100vw-32px)] rounded-3xl">
          <DialogHeader><DialogTitle>{infoDialog?.title}</DialogTitle></DialogHeader>
          <p className="text-sm leading-7 text-[#4b5563]">{infoDialog?.content}</p>
          <Button className="h-12 rounded-2xl bg-[var(--color-primary)]" onClick={() => setInfoDialog(null)}>知道了</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

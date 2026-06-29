"use client";

import { ArrowLeft, Clock, Heart, Loader2, MapPin, MessageCircle, MoreHorizontal, Phone, Share2, Sparkles, Tag, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BottomNav } from "@/components/mobile/BottomNav";
import { MatchPetCard } from "@/components/mobile/MatchPetCard";
import { StatusBadge } from "@/components/mobile/StatusBadge";
import { EmptyState } from "@/components/mobile/States";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SafePetImage } from "@/components/SafePetImage";
import { addComment, getComments, getFavorites, getPet, matchPet, toggleFavorite, type MobileComment, type PetItem } from "@/lib/api";
import type { PetMatchResult } from "@/lib/ai/types";

export function MobilePetDetail({ id }: { id?: string }) {
  const [item, setItem] = useState<PetItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [contactOpen, setContactOpen] = useState(false);
  const [matches, setMatches] = useState<PetMatchResult[]>([]);
  const [matching, setMatching] = useState(false);
  const [comments, setComments] = useState<MobileComment[]>([]);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const activeId = id || new URLSearchParams(window.location.search).get("id") || "";
    setLoading(true);
    getPet(activeId)
      .then((next) => {
        setItem(next);
        setFavorites(getFavorites());
        if (next) {
          setComments(getComments(next.pet.id));
          void runMatchFor(next.pet.id, false);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const runMatchFor = async (postId: string, showToast = true) => {
    setMatching(true);
    try {
      const result = await matchPet(postId);
      setMatches((result.matches ?? []).slice(0, 3));
      if (showToast && !result.matches?.length) toast.message("暂未找到相似宠物，请稍后再试或扩大搜索范围。");
    } catch {
      if (showToast) toast.error("AI 匹配失败，请稍后再试");
    } finally {
      setMatching(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#fff8f1] p-6 text-center md:hidden">正在加载宠物信息...</div>;
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#fff8f1] p-4 md:hidden">
        <EmptyState title="没有找到宠物信息" description="这条信息可能已下架，或还没有同步到数据库。" />
      </div>
    );
  }

  const pet = item.pet;
  const images = pet.images.length ? pet.images : ["/pet-images/cat-orange.jpg"];
  const isLost = item.kind === "lost";
  const title = isLost ? `${pet.breed || item.pet.name}（${pet.gender || "未知"}）` : `${pet.breed || pet.type}（${pet.gender || "未知"}）`;
  const petLocation = item.kind === "lost" ? item.pet.location : item.pet.foundLocation;
  const petTime = item.kind === "lost" ? item.pet.lostTime : item.pet.foundTime;
  const tags = [pet.color, "中型", item.kind === "lost" ? item.pet.age : "成年", "已绝育"].filter(Boolean);

  const submitComment = () => {
    if (!commentText.trim()) {
      toast.error("请先填写留言");
      return;
    }
    const next = addComment(pet.id, commentText.trim());
    setComments([next, ...comments]);
    setCommentText("");
    toast.success("留言已发布");
  };

  return (
    <div className="min-h-screen bg-[#fff8f1] pb-[calc(88px+env(safe-area-inset-bottom))] md:hidden">
      <main className="mx-auto max-w-md px-4 pb-5 pt-4">
        <header className="mb-4 grid grid-cols-[44px_1fr_88px] items-center">
          <button type="button" onClick={() => history.back()} className="flex h-11 w-11 items-center justify-center"><ArrowLeft className="h-7 w-7" /></button>
          <h1 className="text-center text-xl font-black">宠物详情</h1>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => { navigator.clipboard?.writeText(location.href); toast.success("链接已复制"); }}><Share2 className="h-6 w-6" /></button>
            <button type="button" onClick={() => toast.message("更多操作将在后续开放")}><MoreHorizontal className="h-6 w-6" /></button>
          </div>
        </header>

        <section className="overflow-hidden rounded-3xl bg-white shadow-card">
          <div className="relative">
            <SafePetImage src={images[imageIndex]} alt={title} className="h-72 w-full rounded-b-none" />
            <span className="absolute left-4 top-4"><StatusBadge kind={item.kind} status={"status" in pet ? pet.status : undefined} /></span>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((image, index) => (
                <button key={`${image}-${index}`} type="button" aria-label={`查看第 ${index + 1} 张图片`} onClick={() => setImageIndex(index)} className={`h-2 w-2 rounded-full ${index === imageIndex ? "bg-white" : "bg-white/45"}`} />
              ))}
            </div>
            <span className="absolute bottom-4 right-4 rounded-full bg-black/55 px-3 py-1.5 text-sm font-black text-white">{imageIndex + 1}/{images.length}</span>
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between">
              <h2 className="text-2xl font-black">{title}</h2>
              <button onClick={() => { setFavorites(toggleFavorite(pet.id)); toast.success("收藏状态已更新"); }} className="flex items-center gap-1 text-sm font-bold text-[#5f4a38]">
                <Heart className={favorites.includes(pet.id) ? "h-6 w-6 fill-primary text-primary" : "h-6 w-6"} />收藏
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-[#5f4a38]">{tag}</span>)}</div>
            <div className="mt-4 space-y-3 text-[15px]">
              <Info icon={Clock} label={isLost ? "走失时间" : "发现时间"} value={petTime} />
              <Info icon={MapPin} label={isLost ? "走失地点" : "发现地点"} value={petLocation} />
              <Info icon={Tag} label="特征" value={pet.traits} />
              <Info icon={UserRound} label="发布者" value={`${pet.contactName}  已实名认证`} />
            </div>
            <Button onClick={() => setContactOpen(true)} className="mt-5 h-14 w-full rounded-2xl bg-primary text-lg hover:bg-primary/90"><Phone className="h-5 w-5" />联系发布者</Button>
            <Button onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("链接已复制"); }} variant="outline" className="mt-3 h-12 w-full rounded-2xl border-primary/30 text-primary"><Share2 className="h-5 w-5" />分享给更多人</Button>
          </div>
        </section>

        <section className="mt-4 rounded-3xl border border-primary/15 bg-white p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-black">AI匹配相似宠物</h3>
            <Button size="sm" variant="ghost" className="text-primary" onClick={() => runMatchFor(pet.id)} disabled={matching}>
              {matching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}查看全部
            </Button>
          </div>
          {matches.length ? (
            <div className="flex gap-3 overflow-x-auto pb-1">{matches.map((match) => <MatchPetCard key={match.postId} match={match} />)}</div>
          ) : (
            <EmptyState title={matching ? "正在匹配" : "暂未匹配"} description={matching ? "AI 正在为你寻找相似信息。" : "暂未找到相似宠物，请稍后再试或扩大搜索范围。"} />
          )}
        </section>

        <section className="mt-4 rounded-3xl bg-white p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-black">留言板（{comments.length}）</h3>
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div className="flex gap-2">
            <Input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="写留言，提供线索或补充信息" />
            <Button onClick={submitComment} className="bg-primary">发送</Button>
          </div>
          <div className="mt-4 space-y-3">
            {comments.length ? comments.slice(0, 4).map((comment) => (
              <div key={comment.id} className="rounded-2xl bg-[#fff8f1] p-3 text-sm"><b>{comment.author}</b><p className="mt-1 text-[#4b5563]">{comment.content}</p></div>
            )) : <p className="text-sm text-[#666]">暂无留言，新的线索会显示在这里。</p>}
          </div>
        </section>
      </main>
      <BottomNav />

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="max-w-[calc(100vw-32px)] rounded-3xl">
          <DialogHeader><DialogTitle>联系发布者</DialogTitle></DialogHeader>
          <p className="rounded-2xl bg-orange-50 p-4 text-xl font-black">{pet.contactName}</p>
          <p className="rounded-2xl bg-orange-50 p-4 text-xl font-black">{pet.contactPhone}</p>
          <Button className="h-12 rounded-2xl bg-primary" onClick={() => { navigator.clipboard?.writeText(pet.contactPhone); toast.success("联系方式已复制"); }}>复制联系方式</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return <div className="grid grid-cols-[92px_1fr] gap-3"><span className="flex items-center gap-2 font-bold text-[#252525]"><Icon className="h-5 w-5 text-primary" />{label}</span><span className="text-[#374151]">{value}</span></div>;
}

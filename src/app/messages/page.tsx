"use client";

import { CheckCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BottomNav } from "@/components/mobile/BottomNav";
import { MessageActionSheet } from "@/components/mobile/MessageActionSheet";
import { MessageCard } from "@/components/mobile/MessageCard";
import { MessageTabs, tabOf, type MessageTab } from "@/components/mobile/MessageTabs";
import { SearchBar } from "@/components/mobile/SearchBar";
import { EmptyState, ErrorState, LoadingState } from "@/components/mobile/States";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { deleteMessage, getMessages, markAllMessagesRead, markMessageRead, type MobileMessage } from "@/lib/mobile-api";

export default function MessagesPage() {
  const [messages, setMessages] = useState<MobileMessage[]>([]);
  const [tab, setTab] = useState<MessageTab>("全部");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeMessage, setActiveMessage] = useState<MobileMessage | null>(null);
  const [actionOpen, setActionOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [reply, setReply] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getMessages();
      setMessages(result.messages);
    } catch {
      setError("消息加载失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => messages.filter((message) => {
    const tabMatch = tab === "全部" || tabOf(message) === tab;
    const text = [message.title, message.content, message.source].join(" ");
    return tabMatch && (!query.trim() || text.includes(query.trim()));
  }), [messages, query, tab]);

  const unreadCount = messages.filter((message) => message.unread).length;

  const read = async (message: MobileMessage) => {
    await markMessageRead(message.id);
    setMessages((prev) => prev.map((item) => item.id === message.id ? { ...item, unread: false, unreadCount: 0 } : item));
  };

  const openMessage = async (message: MobileMessage) => {
    await read(message);
    if (message.type === "chat") {
      setActiveMessage(message);
      setReplyOpen(true);
      return;
    }
    if (message.targetHref) window.location.href = message.targetHref;
  };

  const action = async (message: MobileMessage) => {
    await read(message);
    if (message.type === "chat") {
      setActiveMessage(message);
      setReplyOpen(true);
      return;
    }
    if (message.targetHref) window.location.href = message.targetHref;
  };

  const readAll = async () => {
    await markAllMessagesRead();
    setMessages((prev) => prev.map((message) => ({ ...message, unread: false, unreadCount: 0 })));
    toast.success("已全部标记为已读");
  };

  const remove = async () => {
    if (!activeMessage) return;
    await deleteMessage(activeMessage.id);
    setMessages((prev) => prev.filter((message) => message.id !== activeMessage.id));
    setActionOpen(false);
    toast.success("消息已删除");
  };

  return (
    <div className="min-h-screen bg-[#fff8f1] pb-[calc(88px+env(safe-area-inset-bottom))]">
      <main className="mx-auto max-w-md px-4 pb-5 pt-5">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">消息</h1>
            <p className="mt-1 text-sm text-[#666]">{unreadCount ? `${unreadCount} 条未读消息` : "暂无未读消息"}</p>
          </div>
          <Button type="button" variant="outline" className="h-10 rounded-2xl text-[var(--color-primary)]" onClick={readAll}>
            <CheckCheck className="h-4 w-4" />全部已读
          </Button>
        </header>

        <MessageTabs value={tab} onChange={setTab} messages={messages} />
        <div className="mt-4"><SearchBar value={query} onChange={setQuery} placeholder="搜索消息、线索或通知" /></div>

        <div className="mt-4 space-y-3">
          {loading ? <LoadingState text="正在加载消息..." /> : error ? <ErrorState message={error} onRetry={load} /> : filtered.length ? filtered.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              onOpen={() => openMessage(message)}
              onAction={() => action(message)}
              onMore={() => { setActiveMessage(message); setActionOpen(true); }}
            />
          )) : <EmptyState title="暂无消息" description="有新的线索会第一时间通知你。" />}
        </div>
      </main>
      <BottomNav />

      <MessageActionSheet
        message={activeMessage}
        open={actionOpen}
        onOpenChange={setActionOpen}
        onRead={async () => { if (activeMessage) await read(activeMessage); setActionOpen(false); toast.success("已标记为已读"); }}
        onDelete={remove}
      />

      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent className="max-w-[calc(100vw-32px)] rounded-3xl">
          <DialogHeader><DialogTitle>回复 {activeMessage?.title}</DialogTitle></DialogHeader>
          <p className="rounded-2xl bg-[var(--color-primary-soft)] p-3 text-sm text-[#4b5563]">{activeMessage?.content}</p>
          <Input value={reply} onChange={(event) => setReply(event.target.value)} placeholder="输入回复内容" />
          <Button className="h-12 rounded-2xl bg-[var(--color-primary)]" onClick={() => { if (!reply.trim()) { toast.error("请输入回复内容"); return; } setReply(""); setReplyOpen(false); toast.success("回复已发送（mock）"); }}>发送回复</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

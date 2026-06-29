"use client";

import { Trash2, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { MobileMessage } from "@/lib/mobile-api";

export function MessageActionSheet({
  message,
  open,
  onOpenChange,
  onRead,
  onDelete
}: {
  message: MobileMessage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRead: () => void;
  onDelete: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-32px)] rounded-3xl">
        <DialogHeader><DialogTitle>{message?.title ?? "消息操作"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Button type="button" variant="outline" className="h-12 w-full justify-start rounded-2xl" onClick={onRead}><CheckCircle2 className="h-5 w-5" />标记已读</Button>
          <Button type="button" variant="outline" className="h-12 w-full justify-start rounded-2xl border-red-100 text-[var(--color-danger)]" onClick={onDelete}><Trash2 className="h-5 w-5" />删除消息</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

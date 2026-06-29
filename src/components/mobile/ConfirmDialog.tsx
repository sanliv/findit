"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "确认",
  danger = false,
  onOpenChange,
  onConfirm
}: {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  danger?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-32px)] rounded-3xl">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <p className="text-sm leading-6 text-[#4b5563]">{description}</p>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-12 rounded-2xl" onClick={() => onOpenChange(false)}>取消</Button>
          <Button className={`h-12 rounded-2xl ${danger ? "bg-[var(--color-danger)] hover:bg-[var(--color-danger)]" : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"}`} onClick={onConfirm}>{confirmText}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

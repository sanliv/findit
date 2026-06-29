import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[94px] w-full rounded-xl border border-[#e3d8cc] bg-white px-3 py-2 text-sm outline-none transition placeholder:text-[#9b9188] focus:border-primary focus:ring-2 focus:ring-primary/15",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold leading-none", className)}
      {...props}
    />
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-[#e3d8cc] bg-white px-3 text-sm outline-none transition placeholder:text-[#9b9188] focus:border-primary focus:ring-2 focus:ring-primary/15",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

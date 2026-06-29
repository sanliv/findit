"use client";

import { useState } from "react";
import { PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";

export function SafePetImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [error, setError] = useState(false);
  if (error || !src) {
    return (
      <div className={cn("flex items-center justify-center bg-orange-50 text-primary", className)}>
        <PawPrint className="h-10 w-10" />
      </div>
    );
  }
  return <img src={src} alt={alt} onError={() => setError(true)} className={cn("object-cover", className)} />;
}

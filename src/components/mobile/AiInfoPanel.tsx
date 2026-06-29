import { Cat, Dog, Edit3, Palette, PawPrint, Ruler, ShieldQuestion, Sparkles } from "lucide-react";
import type { AIPetInfo } from "@/lib/local-store";

export function AiInfoPanel({ aiInfo }: { aiInfo?: AIPetInfo }) {
  if (!aiInfo) return null;

  const petType = aiInfo.petType === "cat" ? "猫咪" : aiInfo.petType === "dog" ? "狗狗" : "其他";
  const rows = [
    { label: "宠物类型", value: petType, icon: aiInfo.petType === "cat" ? Cat : Dog },
    { label: "毛色", value: aiInfo.color.join("、") || "未识别", icon: Palette },
    { label: "品种猜测", value: aiInfo.breed || "未识别", icon: PawPrint },
    { label: "体型", value: aiInfo.size || "未识别", icon: Ruler },
    { label: "年龄", value: aiInfo.ageGuess || "未识别", icon: ShieldQuestion },
    { label: "特征", value: aiInfo.features.join("、") || "未识别", icon: Sparkles }
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-primary-border)] bg-[var(--color-primary-soft)]">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[112px_1fr_24px] items-center border-b border-[var(--color-primary-border)]/60 px-3 py-2.5 last:border-b-0">
          <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary-dark)]">
            <row.icon className="h-4 w-4" />{row.label}
          </span>
          <span className="min-w-0 truncate text-sm font-bold text-[#111827]">{row.value}</span>
          <Edit3 className="h-4 w-4 text-[#94a3b8]" />
        </div>
      ))}
      <div className="border-t border-[var(--color-primary-border)]/60 bg-white/70 px-3 py-3 text-xs leading-5 text-[#64748b]">
        {aiInfo.description || "AI 已完成初步识别，发布前仍可手动修改。"} · 置信度 {aiInfo.confidence}%
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "寻它 FindPet",
  description: "发布走失宠物信息，查看附近线索，帮助宠物回家。"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

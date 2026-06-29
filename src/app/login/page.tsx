"use client";

import { MessageCircle, PawPrint, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/SiteHeader";

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="paw-bg relative flex min-h-[calc(100vh-76px)] items-center justify-center py-10">
        <Card className="w-[480px] p-8 shadow-soft">
          <div className="mb-7 text-center">
            <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white">
              <PawPrint className="h-10 w-10" fill="currentColor" />
            </span>
            <h1 className="text-4xl font-black">登录寻它</h1>
            <p className="mt-2 text-[#6d6258]">登录后可管理发布信息和线索提醒。</p>
          </div>
          <Tabs defaultValue="phone">
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="phone"><Smartphone className="mr-2 h-4 w-4" />手机号</TabsTrigger>
              <TabsTrigger value="wechat"><MessageCircle className="mr-2 h-4 w-4" />微信</TabsTrigger>
            </TabsList>
            <TabsContent value="phone" className="space-y-4">
              <Field label="手机号"><Input placeholder="请输入手机号" /></Field>
              <Field label="验证码">
                <div className="grid grid-cols-[1fr_130px] gap-3">
                  <Input placeholder="请输入验证码" />
                  <Button type="button" variant="outline" onClick={() => toast.info("验证码功能将在后续版本开放")}>获取验证码</Button>
                </div>
              </Field>
              <Button className="w-full" size="lg" onClick={() => toast.info("登录功能将在后续版本开放")}>登录</Button>
            </TabsContent>
            <TabsContent value="wechat" className="space-y-4">
              <Field label="微信号 / 手机号"><Input placeholder="请输入微信或手机号" /></Field>
              <Field label="验证码">
                <div className="grid grid-cols-[1fr_130px] gap-3">
                  <Input placeholder="请输入验证码" />
                  <Button type="button" variant="outline" onClick={() => toast.info("验证码功能将在后续版本开放")}>获取验证码</Button>
                </div>
              </Field>
              <Button className="w-full" size="lg" onClick={() => toast.info("登录功能将在后续版本开放")}>登录</Button>
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}

import { Gift, MapPin, Phone, Tag, UserRound, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PetStatusBadge } from "@/components/PetStatusBadge";
import { SafePetImage } from "@/components/SafePetImage";

export type PreviewPet = {
  name: string;
  type: string;
  breed: string;
  gender: string;
  age: string;
  location: string;
  lostTime: string;
  traits: string;
  collar: boolean;
  contactName: string;
  contactPhone: string;
  reward: string;
  image: string;
};

export function PetPreviewCard({ pet }: { pet: PreviewPet }) {
  return (
    <Card className="p-5">
      <h3 className="mb-5 text-2xl font-black">信息预览</h3>
      <div className="rounded-2xl border border-[#eadfd3] bg-white p-4 shadow-card">
        <div className="grid grid-cols-[150px_1fr] gap-4">
          <SafePetImage src={pet.image} alt={pet.name || "宠物照片"} className="h-[190px] rounded-xl" />
          <div>
            <div className="flex justify-end"><PetStatusBadge status="searching" /></div>
            <h4 className="mt-2 text-4xl font-black">{pet.name || "宠物名字"}</h4>
            <p className="mt-3 text-lg">{pet.breed || pet.type} / {pet.gender} / {pet.age}</p>
            <div className="mt-4 space-y-3 text-sm text-[#534940]">
              <p className="flex gap-2"><MapPin className="h-4 w-4 text-primary" />{pet.location || "走失地点待填写"}</p>
              <p className="flex gap-2"><Clock className="h-4 w-4 text-primary" />{pet.lostTime || "走失时间待填写"}</p>
              <p className="flex gap-2"><Tag className="h-4 w-4 text-primary" />{pet.traits || "明显特征待填写"}</p>
              {pet.collar && <p className="flex gap-2"><Tag className="h-4 w-4 text-primary" />项圈：蓝色</p>}
            </div>
          </div>
        </div>
        <div className="mt-5 border-t pt-4 text-sm">
          <p className="mb-2 flex items-center gap-2"><UserRound className="h-4 w-4 text-primary" />{pet.contactName || "联系人"}</p>
          <p className="mb-2 flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />{pet.contactPhone || "手机号 / 微信"}</p>
          <p className="flex items-center gap-2"><Gift className="h-4 w-4 text-primary" />{pet.reward || "是否悬赏"}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-[#8c8178]">* 预览效果仅供参考，最终以发布内容为准</p>
    </Card>
  );
}

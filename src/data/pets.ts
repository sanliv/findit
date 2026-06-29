export type PetStatus = "searching" | "clue" | "found" | "urgent";
export type PetType = "猫" | "狗" | "其他";

export type AIPetInfo = {
  petType: "cat" | "dog" | "other" | "";
  breed: string;
  color: string[];
  pattern: string[];
  size: "small" | "medium" | "large" | "";
  ageGuess: string;
  genderGuess: string;
  features: string[];
  description: string;
  confidence: number;
  raw?: unknown;
};

export type AIMatchInfo = {
  lastMatchedAt: string;
  candidates: Array<{ postId: string; score: number; reasons: string[] }>;
};

export type Clue = {
  id: string;
  petId: string;
  finderName: string;
  finderContact: string;
  seenTime: string;
  seenLocation: string;
  message: string;
  image: string;
  createdAt: string;
};

export type Pet = {
  id: string;
  name: string;
  type: PetType;
  breed: string;
  gender: string;
  age: string;
  color: string;
  status: PetStatus;
  location: string;
  lostTime: string;
  lastSeenDetail: string;
  traits: string;
  description: string;
  contactName: string;
  contactPhone: string;
  reward: string;
  images: string[];
  coordinates: { x: number; y: number; label: string };
  clues: Clue[];
  createdAt: string;
  aiInfo?: AIPetInfo;
  matchInfo?: AIMatchInfo;
};

export type FoundPet = {
  id: string;
  type: PetType;
  breed: string;
  gender: string;
  color: string;
  foundLocation: string;
  foundTime: string;
  traits: string;
  description: string;
  contactName: string;
  contactPhone: string;
  images: string[];
  coordinates?: { x: number; y: number; label: string };
  status: "waiting" | "reunited";
  createdAt: string;
  aiInfo?: AIPetInfo;
  matchInfo?: AIMatchInfo;
};

const now = "2026-06-24T10:00:00.000Z";
const img = {
  orangeCat: "/pet-images/cat-orange.jpg",
  grayCat: "/pet-images/cat-gray.jpg",
  blackCat: "/pet-images/cat-black.jpg",
  whiteDog: "/pet-images/dog-white.jpg",
  shiba: "/pet-images/dog-shiba.jpg",
  poodle: "/pet-images/dog-poodle.jpg",
  golden: "/pet-images/dog-golden.jpg",
  corgi: "/pet-images/dog-corgi.jpg"
};

export const pets: Pet[] = [
  {
    id: "kele",
    name: "可乐",
    type: "猫",
    breed: "橘猫",
    gender: "公",
    age: "2岁",
    color: "橘色",
    status: "searching",
    location: "上海市 浦东新区 世纪公园附近",
    lostTime: "2026-06-20 晚上 8:30",
    lastSeenDetail: "世纪公园一号门附近花坛旁",
    traits: "右耳有小缺口，蓝色项圈，亲人",
    description: "可乐性格亲人，听到名字会回头。走失时戴蓝色项圈，请先拍照并联系主人，不要追赶。",
    contactName: "李女士",
    contactPhone: "138 1234 5678",
    reward: "500元",
    images: [img.orangeCat, "/pet-images/cat-orange-side.jpg", "/pet-images/cat-orange-rest.jpg"],
    coordinates: { x: 55, y: 50, label: "世纪公园附近" },
    clues: [],
    createdAt: now
  },
  {
    id: "doudou",
    name: "豆豆",
    type: "狗",
    breed: "比熊",
    gender: "公",
    age: "3岁",
    color: "白色",
    status: "searching",
    location: "上海市 浦东新区 红树林公园附近",
    lostTime: "2026-06-19 下午 5:20",
    lastSeenDetail: "红树林公园北门",
    traits: "红色胸背带，体型小，性格活泼",
    description: "豆豆走失时戴红色胸背带，看到人会摇尾巴但可能紧张。",
    contactName: "王先生",
    contactPhone: "138 0000 2688",
    reward: "300元",
    images: [img.whiteDog],
    coordinates: { x: 28, y: 42, label: "红树林公园附近" },
    clues: [],
    createdAt: now
  },
  {
    id: "naitang",
    name: "奶糖",
    type: "猫",
    breed: "英短",
    gender: "母",
    age: "1岁",
    color: "灰白",
    status: "clue",
    location: "上海市 浦东新区 海韵社区附近",
    lostTime: "2026-06-20 上午 10:00",
    lastSeenDetail: "海韵社区南门",
    traits: "粉色铃铛项圈，鼻尖有灰斑",
    description: "奶糖比较怕生，请勿追赶，看到请拍照提供位置。",
    contactName: "赵女士",
    contactPhone: "139 2323 8888",
    reward: "200元",
    images: [img.grayCat],
    coordinates: { x: 40, y: 70, label: "海韵社区附近" },
    clues: [],
    createdAt: now
  },
  {
    id: "xiaoqi",
    name: "小七",
    type: "狗",
    breed: "柴犬",
    gender: "公",
    age: "4岁",
    color: "黄白",
    status: "searching",
    location: "上海市 浦东新区 万象城附近",
    lostTime: "2026-06-20 下午 6:15",
    lastSeenDetail: "万象城东门",
    traits: "绿色背带，爱笑亲人",
    description: "小七对零食有反应，听到名字会回头。",
    contactName: "周先生",
    contactPhone: "136 4545 9012",
    reward: "1000元",
    images: [img.shiba],
    coordinates: { x: 34, y: 60, label: "万象城附近" },
    clues: [],
    createdAt: now
  },
  {
    id: "aoao",
    name: "奥利奥",
    type: "猫",
    breed: "奶牛猫",
    gender: "公",
    age: "2岁",
    color: "黑白",
    status: "found",
    location: "上海市 浦东新区 金展中心附近",
    lostTime: "2026-06-19 晚上 9:30",
    lastSeenDetail: "金展中心停车场",
    traits: "下巴有黑点，调皮可爱",
    description: "已在热心人帮助下找回。",
    contactName: "刘女士",
    contactPhone: "137 1111 2222",
    reward: "无",
    images: [img.blackCat],
    coordinates: { x: 61, y: 72, label: "金展中心附近" },
    clues: [],
    createdAt: now
  },
  {
    id: "qiuqiu",
    name: "球球",
    type: "狗",
    breed: "泰迪",
    gender: "公",
    age: "2岁",
    color: "棕色",
    status: "searching",
    location: "上海市 浦东新区 中央公园附近",
    lostTime: "2026-06-20 下午 3:40",
    lastSeenDetail: "中央公园西侧草坪",
    traits: "棕色卷毛，蓝色围巾",
    description: "球球亲人，看到牵引绳会靠近。",
    contactName: "陈女士",
    contactPhone: "135 6767 1111",
    reward: "500元",
    images: [img.poodle],
    coordinates: { x: 52, y: 38, label: "中央公园附近" },
    clues: [],
    createdAt: now
  },
  {
    id: "duoduo",
    name: "金毛多多",
    type: "狗",
    breed: "金毛",
    gender: "母",
    age: "5岁",
    color: "金色",
    status: "found",
    location: "上海市 浦东新区 滨海大道附近",
    lostTime: "2026-06-15",
    lastSeenDetail: "滨海大道辅路",
    traits: "温顺，左后腿毛色浅",
    description: "感谢好心人的帮助，多多已经安全回家。",
    contactName: "何先生",
    contactPhone: "139 9090 8080",
    reward: "无",
    images: [img.golden],
    coordinates: { x: 69, y: 56, label: "滨海大道附近" },
    clues: [],
    createdAt: now
  },
  {
    id: "buding",
    name: "柯基布丁",
    type: "狗",
    breed: "柯基",
    gender: "公",
    age: "4岁",
    color: "黄白",
    status: "urgent",
    location: "上海市 浦东新区 海心沙附近",
    lostTime: "2026-06-10",
    lastSeenDetail: "海心沙码头附近",
    traits: "短腿，白围脖",
    description: "疑似跑向主干道，请附近朋友帮忙留意。",
    contactName: "许先生",
    contactPhone: "138 6000 7788",
    reward: "1200元",
    images: [img.corgi],
    coordinates: { x: 75, y: 48, label: "海心沙附近" },
    clues: [],
    createdAt: now
  }
];

export const defaultFoundPets: FoundPet[] = [
  {
    id: "found-orange-cat",
    type: "猫",
    breed: "中华田园猫",
    gender: "公",
    color: "橘色",
    foundLocation: "上海市 浦东新区 张江高科地铁站附近",
    foundTime: "2026-05-20 18:30",
    traits: "亲人爱蹭，尾巴有浅色环纹",
    description: "在地铁站附近徘徊，暂时安置在家中，希望主人尽快联系。",
    contactName: "李先生",
    contactPhone: "138 **** 5678",
    images: [img.orangeCat],
    status: "waiting",
    createdAt: now
  },
  {
    id: "found-poodle",
    type: "狗",
    breed: "泰迪犬",
    gender: "母",
    color: "棕色",
    foundLocation: "上海市 静安区 南京西路附近",
    foundTime: "2026-05-20 16:20",
    traits: "体型小，毛发卷曲，戴蓝色项圈",
    description: "很亲人，疑似走失不久。",
    contactName: "王女士",
    contactPhone: "150 **** 2345",
    images: [img.poodle],
    status: "waiting",
    createdAt: now
  },
  {
    id: "found-cow-cat",
    type: "猫",
    breed: "中华田园猫",
    gender: "公",
    color: "黑白",
    foundLocation: "上海市 徐汇区 漕河泾附近",
    foundTime: "2026-05-19 22:10",
    traits: "脸部对称，左前脚有白袜子",
    description: "躲在小区楼道，已喂食饮水。",
    contactName: "张先生",
    contactPhone: "139 **** 8899",
    images: [img.blackCat],
    status: "waiting",
    createdAt: now
  },
  {
    id: "found-corgi",
    type: "狗",
    breed: "柯基犬",
    gender: "公",
    color: "黄白",
    foundLocation: "上海市 闵行区 七宝万科广场附近",
    foundTime: "2026-05-19 15:40",
    traits: "短腿长身，耳朵直立，活泼亲人",
    description: "在商场门口附近跟随路人。",
    contactName: "刘女士",
    contactPhone: "152 **** 1122",
    images: [img.corgi],
    status: "waiting",
    createdAt: now
  }
];

export const getPet = (id: string) => pets.find((pet) => pet.id === id) ?? pets[0];
export const searchingPets = pets.filter((pet) => pet.status !== "found");
export const foundPets = pets.filter((pet) => pet.status === "found");

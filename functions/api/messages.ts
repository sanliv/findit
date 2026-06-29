const messages = [
  { id: "msg-clue-1", type: "clue", title: "新的线索反馈", content: "有人在世纪公园附近看到疑似柯基", source: "柯基（公） · 浦东新区", time: "09:32", unread: true, unreadCount: 2, actionLabel: "查看线索", targetHref: "/pet-detail/?id=doudou", image: "/pet-images/dog-corgi.jpg" },
  { id: "msg-chat-1", type: "chat", title: "张女士", content: "我好像在世纪公园附近见过它", source: "私信 · 上海浦东新区", time: "08:45", unread: true, unreadCount: 1, actionLabel: "回复", targetHref: "/pet-detail/?id=doudou", image: "/pet-images/cat-orange.jpg" },
  { id: "msg-ai-1", type: "ai", title: "AI匹配结果已更新", content: "为你找到 3 条相似宠物线索", source: "AI匹配", time: "昨天 18:20", unread: true, actionLabel: "查看匹配", targetHref: "/pet-detail/?id=doudou" },
  { id: "msg-system-1", type: "system", title: "发布审核通过", content: "你的寻宠信息已发布成功", source: "系统通知", time: "周一 10:30", unread: false, actionLabel: "查看发布", targetHref: "/profile" }
];

export function onRequestGet() {
  return Response.json({ messages }, { headers: { "cache-control": "no-store" } });
}

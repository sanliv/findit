export function onRequestGet() {
  return Response.json({
    name: "张女士",
    verified: true,
    bio: "爱宠是家人，愿每一次寻找都有回响。",
    avatar: "/pet-images/dog-white.jpg",
    stats: { posts: 12, favorites: 8, drafts: 3, clues: 5 }
  }, { headers: { "cache-control": "no-store" } });
}

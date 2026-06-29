export function onRequestGet() {
  return Response.json({ favorites: [] }, { headers: { "cache-control": "no-store" } });
}

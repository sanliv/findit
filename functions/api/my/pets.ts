export function onRequestGet() {
  return Response.json({ pets: [] }, { headers: { "cache-control": "no-store" } });
}

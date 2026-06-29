export function onRequestGet() {
  return Response.json({ drafts: [] }, { headers: { "cache-control": "no-store" } });
}

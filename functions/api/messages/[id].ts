export async function onRequestDelete() {
  return Response.json({ success: true }, { headers: { "cache-control": "no-store" } });
}

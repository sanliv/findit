export async function onRequestPost() {
  return Response.json({ success: true }, { headers: { "cache-control": "no-store" } });
}

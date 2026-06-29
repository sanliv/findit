type FunctionContext = {
  request: Request;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

export async function onRequestPost({ request }: FunctionContext) {
  try {
    const body = (await request.json()) as { address?: string };
    return json({
      success: true,
      data: {
        latitude: 31.2304,
        longitude: 121.4737,
        map_address: body.address || "上海市 浦东新区 世纪大道",
        mock: true
      },
      latitude: 31.2304,
      longitude: 121.4737,
      map_address: body.address || "上海市 浦东新区 世纪大道",
      mock: true
    });
  } catch {
    return json({ success: false, message: "地图定位失败，请手动填写地址。" }, 400);
  }
}

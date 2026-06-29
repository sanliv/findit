type Env = {
  DOUBAO_API_KEY?: string;
  DOUBAO_API_URL?: string;
  DOUBAO_MODEL?: string;
};

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init?.headers || {})
    }
  });
}

function extractResponseText(data: any): string {
  if (!data) return "";

  if (typeof data.output_text === "string") {
    return data.output_text;
  }

  if (Array.isArray(data.output)) {
    const parts: string[] = [];

    for (const item of data.output) {
      if (typeof item?.content === "string") {
        parts.push(item.content);
      }

      if (Array.isArray(item?.content)) {
        for (const content of item.content) {
          if (typeof content?.text === "string") {
            parts.push(content.text);
          }

          if (typeof content?.output_text === "string") {
            parts.push(content.output_text);
          }
        }
      }
    }

    if (parts.length) return parts.join("\n");
  }

  if (Array.isArray(data.choices)) {
    const text = data.choices
      .map((choice: any) => choice?.message?.content || choice?.text || "")
      .filter(Boolean)
      .join("\n");

    if (text) return text;
  }

  return "";
}

function tryParseJson(text: string) {
  if (!text) return null;

  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function normalizePetInfo(parsed: any, rawText: string) {
  return {
    species: parsed?.species || parsed?.宠物类型 || parsed?.类型 || "未知",
    breed: parsed?.breed || parsed?.品种 || "未知",
    color: parsed?.color || parsed?.颜色 || "未知",
    age: parsed?.age || parsed?.年龄 || "未知",
    gender: parsed?.gender || parsed?.性别 || "未知",
    features: parsed?.features || parsed?.特征 || parsed?.外观特征 || rawText || "未知",
    collar: parsed?.collar || parsed?.项圈 || "未知",
    summary: parsed?.summary || parsed?.总结 || rawText || "未能生成摘要"
  };
}

export async function onRequest(context: any) {
  const request: Request = context.request;
  const env: Env = context.env || {};

  if (request.method !== "POST") {
    return json(
      {
        success: false,
        message: "请使用 POST 调用 AI 识别接口。"
      },
      { status: 405 }
    );
  }

  if (!env.DOUBAO_API_KEY) {
    return json(
      {
        success: false,
        message: "缺少 DOUBAO_API_KEY，请在 Cloudflare Variables and Secrets 中配置。"
      },
      { status: 500 }
    );
  }

  let body: any;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        success: false,
        message: "请求体必须是 JSON。"
      },
      { status: 400 }
    );
  }

  const imageUrl = body.imageUrl || body.image_url || body.url;

  if (!imageUrl) {
    return json(
      {
        success: false,
        message: "缺少 imageUrl。"
      },
      { status: 400 }
    );
  }

  const apiUrl = env.DOUBAO_API_URL || "https://ark.cn-beijing.volces.com/api/v3/responses";
  const model = env.DOUBAO_MODEL || "doubao-seed-1-8-251228";

  const prompt = `
你是一个寻宠平台的宠物图片识别助手。
请根据图片识别宠物信息，并只返回 JSON，不要输出 markdown，不要解释。

返回格式：
{
  "species": "猫/狗/未知",
  "breed": "品种，不确定就写未知",
  "color": "主要颜色",
  "age": "大致年龄，不确定写未知",
  "gender": "性别，不确定写未知",
  "features": "明显外观特征，例如毛色、脸部纹路、耳朵、尾巴、体型、特殊标记",
  "collar": "项圈/挂牌信息，没有或不确定写未知",
  "summary": "一句话总结"
}
`;

  const payload = {
    model,
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_image",
            image_url: imageUrl
          },
          {
            type: "input_text",
            text: prompt
          }
        ]
      }
    ]
  };

  let aiResponse: Response;

  try {
    aiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.DOUBAO_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch (error: any) {
    return json(
      {
        success: false,
        message: "豆包 Vision 请求失败，可能是网络或接口地址错误。",
        error: String(error?.message || error)
      },
      { status: 502 }
    );
  }

  const responseText = await aiResponse.text();

  let responseData: any = null;
  try {
    responseData = JSON.parse(responseText);
  } catch {
    responseData = {
      raw: responseText
    };
  }

  if (!aiResponse.ok) {
    return json(
      {
        success: false,
        message: "豆包 Vision 调用失败",
        status: aiResponse.status,
        apiUrl,
        model,
        error: responseData
      },
      { status: 502 }
    );
  }

  const outputText = extractResponseText(responseData);
  const parsed = tryParseJson(outputText);
  const data = normalizePetInfo(parsed, outputText);

  return json({
    success: true,
    data,
    raw: responseData,
    text: outputText
  });
}

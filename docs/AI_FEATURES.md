# FindPet AI 功能说明

## 功能介绍

当前版本新增两个 AI 能力：

1. AI识别宠物信息
   - 在发布寻宠页上传照片后点击“AI识别宠物信息”。
   - 自动生成宠物类型、疑似品种、颜色、体型、特征、描述和置信度。
   - 识别结果会随发布信息一起保存到 localStorage。

2. AI匹配相似宠物
   - 在寻宠详情页点击“AI匹配相似宠物”。
   - 系统会把当前走失宠物与“捡到宠物”数据做相似度匹配。
   - 评分依据包括类型、品种、颜色、特征、地点和时间。

当前项目仍是本地 localStorage 数据版本，不接真实数据库。为了让 Cloudflare Pages 静态部署也能演示，前端在 API 不可用时会自动使用 mock 模式回退。

## 环境变量

复制 `.env.example`，并根据需要配置：

```bash
AI_PROVIDER=mock

BAIDU_API_KEY=
BAIDU_SECRET_KEY=

TENCENT_SECRET_ID=
TENCENT_SECRET_KEY=
TENCENT_REGION=ap-guangzhou

AI_MATCH_THRESHOLD=60
```

说明：

- `AI_PROVIDER=mock`：默认模式，不需要密钥，可完整演示识别和匹配。
- `AI_PROVIDER=baidu`：预留百度动物识别接入。
- `AI_PROVIDER=tencent`：预留腾讯云图像搜索/相似图片能力接入。
- `AI_MATCH_THRESHOLD`：匹配阈值，默认 60 分。

## mock 模式如何使用

1. 打开 `/post`。
2. 上传或保留宠物照片。
3. 点击“AI识别宠物信息”。
4. 查看自动填充的品种、颜色、特征和描述。
5. 发布后进入详情页。
6. 在详情页点击“AI匹配相似宠物”。

mock 模式不会调用外部服务，也不会暴露任何密钥。

## 后续接入百度动物识别

已预留：

- `src/lib/ai/providers/baiduProvider.ts`
- `functions/api/ai/analyze-pet.ts`

接入时需要：

1. 在 Cloudflare Pages 环境变量中配置 `AI_PROVIDER=baidu`。
2. 配置 `BAIDU_API_KEY` 和 `BAIDU_SECRET_KEY`。
3. 在 `baiduProvider.ts` 中实现 access token 获取和动物识别接口调用。
4. 将百度返回字段映射为统一的 `AIPetInfo`。

## 后续接入腾讯云图像搜索

已预留：

- `src/lib/ai/providers/tencentProvider.ts`
- `functions/api/ai/match-pets.ts`

接入时需要：

1. 在 Cloudflare Pages 环境变量中配置 `AI_PROVIDER=tencent`。
2. 配置 `TENCENT_SECRET_ID`、`TENCENT_SECRET_KEY`、`TENCENT_REGION`。
3. 在 `tencentProvider.ts` 中实现签名、图片入库或相似图片检索。
4. 将腾讯云结果和本地规则评分合并为统一匹配结果。

## Cloudflare Pages 环境变量配置

在 Cloudflare Dashboard：

1. 进入 Pages 项目。
2. 打开 `Settings`。
3. 进入 `Environment variables`。
4. 分别为 Production / Preview 添加上面的变量。
5. 保存后重新部署。

如果使用 zip 直接上传静态文件，Pages Functions 可能不会随 zip 启用；此时前端会自动使用 mock 回退。若要启用真实服务端 AI 接口，建议使用连接 Git 仓库或 `wrangler pages deploy`，并保留项目根目录的 `functions/api/ai/*`。

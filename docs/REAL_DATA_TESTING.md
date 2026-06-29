# 真实数据闭环测试说明

## Cloudflare Pages 配置

- Framework preset: `None`
- Build command: `pnpm run build`
- Build output directory: `out`
- Root directory: `/`
- D1 binding name: `DB`
- R2 binding name: `BUCKET`

## 环境变量

```text
AI_PROVIDER=doubao
DOUBAO_API_KEY=你的豆包 API Key
DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3/chat/completions
DOUBAO_MODEL=doubao-seed-1-8-vision
AI_MATCH_THRESHOLD=70
R2_PUBLIC_URL=可选，R2 公开访问域名
```

## 数据库初始化

在 Cloudflare D1 控制台或 wrangler 中执行：

```bash
wrangler d1 execute DB --file=migrations/0001_init.sql
```

如果使用 Pages 项目中绑定的 D1，请确认绑定名就是 `DB`。

## 本地 Pages Functions 测试

静态导出构建后运行：

```bash
pnpm run build
npx wrangler pages dev out
```

本地完整测试 D1/R2 需要配置 wrangler 的本地绑定或使用 Cloudflare Pages 线上环境。没有绑定时，API 会返回明确的 JSON 错误，不会回退到 mock 数据。

## 线上页面测试

```text
https://xhl.ccwu.cc/
https://xhl.ccwu.cc/post/
https://xhl.ccwu.cc/found/post/
https://xhl.ccwu.cc/pets/
https://xhl.ccwu.cc/found/
https://xhl.ccwu.cc/pet-detail/?id=真实ID
https://xhl.ccwu.cc/found-detail/?id=真实ID
```

## 线上 API 测试

```text
GET  https://xhl.ccwu.cc/api/pets
POST https://xhl.ccwu.cc/api/pets
GET  https://xhl.ccwu.cc/api/found-pets
POST https://xhl.ccwu.cc/api/found-pets
POST https://xhl.ccwu.cc/api/upload
POST https://xhl.ccwu.cc/api/ai/analyze-pet
POST https://xhl.ccwu.cc/api/ai/match-pets
```

预期：没有数据时页面显示空状态；接口失败时显示连接失败；发布成功后列表和详情读取 D1 真实数据。

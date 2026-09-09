# 模型发布日期与来源

核对日期：2026-09-09。默认按公开发布公告或官方可用性记录排序；不使用样本生成时间、训练截止时间或后续快照更新时间。

| 模型 | 发布日期 | 官方来源 |
|---|---|---|
| GPT-6 Astra | 2026-09-03 | [官方记录](https://developers.openai.com/api/docs/changelog) |
| Gemini 3.8 Flash | 2026-09-02 | [官方记录](https://ai.google.dev/gemini-api/docs/changelog) |
| GLM-5.3 | 2026-08-14 | [官方记录](https://z.ai/blog/glm-5.3) |
| Gemini 3.7 Flash | 2026-08-13 | [官方记录](https://ai.google.dev/gemini-api/docs/changelog) |
| Grok 4.6 | 2026-08-12 | [官方记录](https://x.ai/news/grok-4-6) |
| Qwen3.8-Max | 2026-08-03 | [官方记录](https://qwen.ai/blog?id=qwen3.8) |
| Gemini 3.6 Flash | 2026-07-21 | [官方记录](https://ai.google.dev/gemini-api/docs/changelog) |
| Grok 4.5 | 2026-07-16 | [官方记录](https://x.ai/news/grok-4-5) |
| GPT-5.6 Sol | 2026-07-09 | [官方记录](https://developers.openai.com/api/docs/changelog) |
| GPT-5.6 Terra | 2026-07-09 | [官方记录](https://developers.openai.com/api/docs/changelog) |
| GPT-5.6 Luna | 2026-07-09 | [官方记录](https://developers.openai.com/api/docs/changelog) |
| Doubao-Seed-2.1-turbo | 2026-06 | [官方记录](https://www.volcengine.com/docs/82379/1159178) |
| MiniMax M3 | 2026-06-01 | [官方记录](https://www.minimax.io/blog/minimax-m3) |
| Gemini 3.5 Flash | 2026-05-19 | [官方记录](https://ai.google.dev/gemini-api/docs/changelog) |
| DeepSeek-V4-Flash | 2026-04-24 | [官方记录](https://api-docs.deepseek.com/updates) |
| DeepSeek-V4-Pro | 2026-04-24 | [官方记录](https://api-docs.deepseek.com/updates) |
| GPT-5.5 | 2026-04-23 | [官方记录](https://developers.openai.com/codex/changelog) |
| GPT-5.4 | 2026-03-05 | [官方记录](https://developers.openai.com/api/docs/changelog) |
| GPT-5.3 Codex | 2026-02-05 | [官方记录](https://developers.openai.com/codex/changelog) |
| GPT-5.2 | 2025-12-11 | [官方记录](https://developers.openai.com/api/docs/changelog) |
| GPT-5.1 | 2025-11 | [官方记录](https://developers.openai.com/api/docs/changelog) |
| GPT-5 | 2025-08-07 | [官方记录](https://developers.openai.com/api/docs/changelog) |
| GPT-5 mini | 2025-08-07 | [官方记录](https://developers.openai.com/api/docs/changelog) |
| GPT-4.1 | 2025-04-14 | [官方记录](https://developers.openai.com/api/docs/changelog) |
| GPT-4o | 2024-05-13 | [官方记录](https://developers.openai.com/api/docs/models/gpt-4o) |

- DeepSeek-V4-Flash：采用 V4-Pro / V4-Flash 首次公开可用的 2026-04-24，不使用后续更新或 Vision-Exp 的日期。
- Grok 4.5：发布公告为 2026-07-16，API release notes 写的是 7 月 8 日；本画廊采用公告日期。API 记录：https://docs.x.ai/developers/release-notes 。
- GPT-5.5：Codex 首发 4 月 23 日，API 开放 4 月 24 日，采用较早的官方可用记录。
- GPT-5.3 Codex：首发 2 月 5 日，API 开放 2 月 24 日，采用首发记录。
- GPT-5.1：现有官方 API 来源确认 2025 年 11 月，API 上线日为 13 日；本次仅填写月份，避免把 API 日期当作全渠道首发日。
- GPT-4o：采用首个公开快照的 2024-05-13，而非之后的 8 月、11 月快照。
- GPT-5.6 三个型号同日发布，保留 Sol、Terra、Luna 的稳定顺序。缺失日期的模型排最后。

页面仅使用日期排序，不展示这些维护备注。原始网页文本摘录在 private/release-research/。

- Doubao-Seed-2.1-turbo：官方模型发布公告归入 2026 年 6 月，故只填写月份；不将模型 ID 的快照后缀或第三方平台收录日当成首发日。官方产品更新公告确认名称包含 Seed。
- Qwen3.8-Max：采用官方发布文章的 2026-08-03，不使用后续权重开放或 0902 快照日期。
- GLM-5.3：采用 2026-08-14 的官方发布文章，不使用两周后的权重开放日期。
- MiniMax M3：采用官方发布文章的 2026-06-01，不使用不同接入平台的上架日期。

模型展示名称遵循官方公开名称：DeepSeek-V4-Flash、DeepSeek-V4-Pro、Doubao-Seed-2.1-turbo、GLM-5.3、MiniMax M3、Qwen3.8-Max。更新名称时同步作品、modelOrder 和 modelReleases，保持提供方与模型名称的排序键一致；作品 ID 和资源路径保持稳定。

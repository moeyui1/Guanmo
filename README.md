# 观模 Guanmo

[简体中文](README.md) | [English](README.en.md)

同一道题，不同模型。一个手动维护的 SVG 动画画廊。

目前包含“鹈鹕骑单车”“鹈鹕从右往左运动”和“三花猫滑着滑板从右到左前进”三道题。后两题都要求主体朝左并从画面右侧移动到左侧，只收录默认思考深度；三花猫题目收录 GPT、Gemini 和 Grok 家族。各题的当前提示词可在网站上查看。三花猫题目直接使用中文原句作为用户提示词，不翻译或扩写；只单独指定动态 SVG 输出格式。

**在线浏览：https://moeyui1.github.io/Guanmo/**

- 模型默认按发布日期从新到旧排列。
- 首页每页展示 12 个作品；翻页保留已选作品和思考深度，搜索及提供方筛选从第一页开始。
- 首页卡片可切换已收录的思考深度。
- 高级比较最多展示四份作品，支持同一模型的不同深度和重复样本。
- 支持提供方筛选、搜索、放大、下载、重播和分享比较链接。
- 无数据库和后台，不需要 API 密钥。
- 页面右上角提供 GitHub Star 项目链接。
- 支持中英文界面切换，自动记住语言选择；切换语言保留当前题目、分页、筛选和比较状态。

## 本地运行

需要 Node.js 24，不需要安装第三方依赖。

```sh
npm run dev
```

打开 http://127.0.0.1:4173/ 。

## 添加作品

将 SVG 放入 `public/assets/`，在 `public/data.json` 对应题目的 `samples` 中追加：

```json
{
  "id": "my-model-high-pelican-01",
  "model": "模型名称",
  "provider": "提供方",
  "reasoning": "high",
  "home": false,
  "src": "assets/pelican/my-model-high.svg"
}
```

`id` 必须唯一。首页以 `default` 或 `unspecified` 且 `home` 不为 `false` 的样本创建卡片，也支持显式设置 `home: true`，将任意强度作为初始作品。例如只有最低、中间、最高三档时，可将 Medium 设为 `home: true`，其余两份设为 `false`。同一提供方、同一模型的其他强度自动进入卡片下拉选项，按从低到高排列。重复样本可在高级比较里选择，按顺序显示样本编号。新增提供方和思考深度无需修改页面代码。

新增模型时，在 `modelReleases` 中填写发布日期和来源：

```json
{
  "model": "模型名称",
  "provider": "提供方",
  "releaseDate": "2026-09-02",
  "source": "https://example.com/official-announcement"
}
```

日期支持 `YYYY-MM-DD` 和 `YYYY-MM`。缺失日期排最后，同日发布按 `modelOrder` 保持稳定顺序。见[已收录模型的发布日期与官方来源](docs/model-release-sources.md)。维护备注不显示在作品卡片中。

题目可填写 `titleEn` 作为英文名称；未填写时保留原名称。界面文案集中在 `public/i18n.js`，绘图提示词和 SVG 原始作品不随界面语言变化。

三花猫滑板题目采用自由生成流程：中文主题原样传入，仅声明动态 SVG 输出格式，不预设画布大小、时长或画风。生成后在展示层统一到 16:9 画框。题目或单份作品可设置 `presentation: {"fit":"cover"}` 等比例铺满并裁剪边缘，或 `{"fit":"contain"}` 保留完整画面；宽幅运动场景优先保留完整路径。下载文件保留模型生成的尺寸与动画，必要的语法兼容处理不改变造型或运动参数。

三花猫题目的当前提示词为 `生成一张三花猫滑着滑板从右到左前进的svg动图`，用于新增的 Gemini 和 Grok 作品。早期 GPT 作品使用 `三花猫滑着滑板从右到左前进`；每份作品的实际提示词记录在 `samples[].prompt` 中。

## 构建与部署

```sh
npm run build
```

构建会检查样本、资源路径与发布日期，将静态网站输出到 `dist/`。GitHub Actions 在每次推送到 `main` 时自动构建并部署 GitHub Pages，也可以在 Actions 页面手动运行 **Deploy GitHub Pages**。

资源采用相对路径，路由使用 URL hash，支持 GitHub Pages 的 `/Guanmo/` 项目路径及比较链接刷新。

网站以图片方式加载 SVG。仓库仅包含网站代码和已收录作品，本地生成会话、日志和配置不上传。

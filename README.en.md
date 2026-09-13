# Guanmo

[简体中文](README.md) | [English](README.en.md)

Guanmo compares animated SVG outputs to reveal performance gaps and recurring behavioral styles across models. It also provides a visual reference for spotting possible model substitution or downgrading by third-party API relay services.

Compare outputs from a relay service with the collected samples, looking at instruction following, spatial relationships, motion, composition, and color choices. The manually curated gallery supports comparisons across models, reasoning levels, and repeated samples.

These patterns are clues, not proof of model identity from a single sample. Prompts, reasoning levels, and sampling settings also affect the output.

The collection currently includes three topics: **Pelican riding a bicycle**, **Pelican cycling from right to left**, and **Calico cat skateboarding from right to left**. The latter two focus on right-to-left movement. The calico-cat topic features GPT, Gemini, and Grok, plus manually imported DeepSeek, Kimi, Doubao, GLM, MiniMax, and Qwen artworks. Imported artworks without a supplied reasoning level are marked Unspecified. The current prompt for each topic is available on the site. The calico-cat prompt is sent verbatim in Chinese: `生成一张三花猫滑着滑板从右到左前进的svg动图`. It is not translated or expanded; only the animated SVG output format is specified separately.

**Live site: https://moeyui1.github.io/Guanmo/**

- Models are sorted by release date, newest first.
- The homepage displays 12 artworks per page. Pagination preserves selected artworks and reasoning levels; search and provider filters reset to the first page.
- Switch between available reasoning levels directly on each homepage card.
- Compare up to four artworks, including different reasoning levels or repeated samples of the same model.
- Filter by provider, search, enlarge, download, replay, and share comparison links.
- No database, backend, or API key required.
- A GitHub Star link opens the project repository.
- Switch between Chinese and English. The site remembers your preference and preserves the current topic, page, filters, and comparison selections when you switch.

## Run locally

Requires Node.js 24. No third-party dependencies need to be installed.

```sh
npm run dev
```

Open http://127.0.0.1:4173/.

## Add an artwork

Place the SVG under `public/assets/`, then append an entry to the relevant topic's `samples` array in `public/data.json`:

```json
{
  "id": "my-model-high-pelican-01",
  "model": "Model name",
  "provider": "Provider name",
  "reasoning": "high",
  "home": false,
  "src": "assets/pelican/my-model-high.svg"
}
```

Each `id` must be unique. A sample appears as a homepage card when its reasoning level is `default` or `unspecified` and `home` is not `false`. Setting `home: true` explicitly makes any reasoning level the initial artwork for that card. For a model with only low, middle, and high levels, set Medium to `home: true` and the other two to `false`.

Other levels for the same provider and model appear automatically in the card's dropdown, ordered from lowest to highest. Repeated samples are available in Advanced compare and are numbered in collection order. New providers and reasoning labels require no changes to the page code.

When adding a model, add its release date and source to `modelReleases`:

```json
{
  "model": "Model name",
  "provider": "Provider name",
  "releaseDate": "2026-09-02",
  "source": "https://example.com/official-announcement"
}
```

Dates support `YYYY-MM-DD` and `YYYY-MM`. Models without a date appear last. Models released on the same day follow the stable order in `modelOrder`. See the [release dates and official sources](docs/model-release-sources.md) (in Chinese). Maintenance notes are not shown on artwork cards.

Topics may include a `titleEn` field for their English name; otherwise, the original name is retained. Interface translations live in `public/i18n.js`. Changing the interface language does not translate the original prompts or modify the SVG artworks.

The skateboarding-cat topic uses an open-ended generation process: the Chinese theme is passed verbatim, with only the animated SVG output format specified. Canvas size, duration, and visual style are left to the model. Presentation is standardized afterwards in a 16:9 frame. Set `presentation: {"fit":"cover"}` on a topic or sample to scale proportionally and crop the edges, or `{"fit":"contain"}` to preserve the full scene. Wide moving scenes retain their full travel path. Downloads preserve the generated dimensions and animation; necessary syntax compatibility fixes do not change shapes or motion parameters.

All GPT, Gemini, and Grok artworks for the calico-cat topic use the exact Chinese prompt above, default reasoning, and independent sessions. Known prompts are recorded in `samples[].prompt`; missing generation details for manual imports are not inferred.

## Build and deploy

```sh
npm run build
```

The build validates samples, asset paths, and release dates, then writes the static site to `dist/`. GitHub Actions automatically builds and deploys GitHub Pages whenever changes are pushed to `main`. You can also run **Deploy GitHub Pages** manually from the Actions tab.

Assets use relative paths and navigation uses URL hashes, so the site works under the GitHub Pages `/Guanmo/` project path and comparison links can be refreshed or shared.

SVGs are loaded as images. The repository contains only the site code and collected artworks; local generation sessions, logs, and configuration are not uploaded.

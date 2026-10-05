# Intelligent Error Book

A React/TypeScript coursework project for collecting mistakes, organizing revision and exploring AI-assisted explanations.

软件工程课程作品：错题录入、错题库、复习流程、历史记录与统计面板，使用 React、TypeScript、Vite 和浏览器本地存储。

## Run locally

Node.js 22+:

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Build: `npm run build`. Source modules live under `src/components` and `src/services`.

## AI integration boundary

The original coursework uses a browser-side DashScope integration. The public repository contains **no API key**. Without a key, AI requests fail with a configuration message; local review features can still be explored. Any key injected into a frontend build can be read by browser users. Do not deploy a keyed build publicly; move provider calls to an authenticated backend before sharing a live AI-enabled service.

The old `.env` is excluded from every published commit. If a key was previously pushed elsewhere, deleting it from this repository does not revoke it.

## Project scope

This is a local-storage learning application, not a multi-user learning platform. Browser data can be cleared; it has no production backend, user authentication or server-side backup. [Original notes](README.legacy.md), [course documents](documentation/), [version provenance](docs/SOURCE_HISTORY.md).

## Development and provenance

This is an educational project developed with AI assistance. See [source history](docs/SOURCE_HISTORY.md) for the original records and local version snapshots. Imported commits are not backdated. Follow [CONTRIBUTING](CONTRIBUTING.md) for future changes.

本项目用于课程学习与求职作品展示，开发和本次仓库整理使用了 AI 辅助。可运行代码与验证记录不等于所有代码均由本人独立手写，也不代表生产系统经验。历史说明中的本机路径与旧验收记录仅供追溯。

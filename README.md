# Magma WebOS

Magma is a local-first WebOS built with React, Vite, and TypeScript. It runs in the browser and stores user data in the browser file system.

## Local development

```bash
npm install
npm run dev
```

For a production-like local build:

```bash
npm run build-static
npm run preview
```

## Cloudflare Workers

The project deploys as a Workers static-assets application. Wrangler builds the React app into `dist`, uploads those assets, and uses `worker/index.ts` for health/config routes and the optional Wisp WebSocket bridge.

```bash
npm run build:worker
npx wrangler dev
npm run deploy
```

Set the Cloudflare Worker variable `WISP_URL` to an externally hosted Wisp WebSocket endpoint, such as `wss://proxy.example.com/wisp/`, if browser proxy features are needed. The deploy script preserves variables configured in the Cloudflare Dashboard. Workers can bridge the WebSocket connection, but the original Node `mrrowisp` TCP/UDP listener is not a Workers runtime component. `AUTH_BASE_URL` is optional and can point to a separately hosted Magma-compatible auth service.

The Worker exposes `/health`, `/api/config`, and `/wisp/*`. The Node server remains available for self-hosted deployments that need to run `mrrowisp` locally.

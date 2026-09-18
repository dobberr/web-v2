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

## Self-hosted server

The production server serves the built app and runs the Wisp WebSocket proxy in the same Node process.

```bash
npm install
npm start
```

Configure `PORT` and `WISP_PORT` in `.env` before starting the server. The default Wisp endpoint is `/wisp/`.

For development, use `npm run dev`.

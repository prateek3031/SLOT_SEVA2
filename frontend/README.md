# SlotSeva frontend

React 19, TypeScript, Vite, and Tailwind CSS 4.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```powershell
npm install
npm run dev
```

Vite prints the local URL when the development server starts. Start the backend
separately from `../backend` using the instructions in its README. Vite proxies
`/api` requests to the backend at `http://127.0.0.1:8001`.

## Checks

```powershell
npm run lint
npm run build
```

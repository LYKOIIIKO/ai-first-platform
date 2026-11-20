FROM node:24.22.3-bookworm-slim AS workspace
WORKDIR /workspace
RUN npm install --global --no-audit --no-fund pnpm@12.22.0

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

FROM workspace AS api
COPY apps/api/package.json apps/api/package.json
RUN pnpm --filter @platform/api install --frozen-lockfile
COPY apps/api/ apps/api/
WORKDIR /workspace/apps/api
CMD ["node", "--watch", "--import", "tsx", "src/main.ts"]

FROM workspace AS web
COPY apps/web/package.json apps/web/package.json
RUN pnpm --filter @platform/web install --frozen-lockfile
COPY apps/web/ apps/web/
WORKDIR /workspace/apps/web
CMD ["node", "node_modules/vite/bin/vite.js"]

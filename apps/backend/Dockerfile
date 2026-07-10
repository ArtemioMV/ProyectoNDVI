FROM node:22-alpine AS deps
WORKDIR /workspace
COPY package.json pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages packages
RUN npm install -g pnpm@9.15.0 --fetch-retries=5 --fetch-retry-maxtimeout=120000 --fetch-timeout=120000 && pnpm install --filter @iptv/backend --prod=false

FROM deps AS development
COPY apps/backend apps/backend
RUN pnpm --filter @iptv/backend prisma:generate
EXPOSE 3000
CMD ["pnpm", "--filter", "@iptv/backend", "dev"]

FROM deps AS build
COPY apps/backend apps/backend
RUN pnpm --filter @iptv/backend prisma:generate && pnpm --filter @iptv/backend build

FROM build AS production
ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "--filter", "@iptv/backend", "start"]
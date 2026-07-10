FROM node:22-alpine AS deps
WORKDIR /workspace
COPY package.json pnpm-workspace.yaml ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages packages
RUN npm install -g pnpm@9.15.0 --fetch-retries=5 --fetch-retry-maxtimeout=120000 --fetch-timeout=120000 && pnpm install --filter @iptv/frontend --prod=false

FROM deps AS development
COPY apps/frontend apps/frontend
EXPOSE 5173
CMD ["pnpm", "--filter", "@iptv/frontend", "dev", "--host", "0.0.0.0"]

FROM deps AS build
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY apps/frontend apps/frontend
RUN pnpm --filter @iptv/frontend build

FROM nginx:1.29-alpine AS production
COPY apps/frontend/nginx.production.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
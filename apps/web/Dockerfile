FROM node:22.13-alpine AS base
WORKDIR /app
RUN apk add --no-cache python3 make g++ \
  && corepack enable \
  && corepack prepare pnpm@9.15.0 --activate
ENV HUSKY=0

FROM base AS build
ARG VITE_API_URL=
ARG VITE_SITE_URL=
ARG VITE_WALLETCONNECT_PROJECT_ID=
ARG VITE_DEFAULT_CHAIN_ID=84532
ENV VITE_API_URL=$VITE_API_URL \
    VITE_SITE_URL=$VITE_SITE_URL \
    VITE_WALLETCONNECT_PROJECT_ID=$VITE_WALLETCONNECT_PROJECT_ID \
    VITE_DEFAULT_CHAIN_ID=$VITE_DEFAULT_CHAIN_ID
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile --filter web...
COPY apps/web ./apps/web
WORKDIR /app/apps/web
RUN pnpm run build

FROM nginx:1.27-alpine AS release
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

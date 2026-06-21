FROM node:22.13-alpine AS base
WORKDIR /app
RUN corepack enable \
  && corepack prepare pnpm@9.15.0 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile --filter api...

FROM base AS release
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY apps/api ./apps/api
WORKDIR /app/apps/api
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "--import", "tsx", "src/main.ts"]

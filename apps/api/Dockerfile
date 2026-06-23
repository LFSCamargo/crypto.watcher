FROM node:22.13-alpine AS base
WORKDIR /app
RUN apk add --no-cache python3 make g++ \
  && corepack enable \
  && corepack prepare pnpm@9.15.0 --activate
ENV HUSKY=0

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/email-templates/package.json packages/email-templates/package.json
RUN pnpm install --frozen-lockfile --filter api...
COPY packages/email-templates ./packages/email-templates
COPY apps/api ./apps/api
RUN pnpm --filter email-templates run build

FROM node:22.13-alpine AS release
WORKDIR /app
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nodejs -u 1001 -G nodejs
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api ./apps/api
COPY --from=build /app/packages/email-templates ./packages/email-templates
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=build /app/package.json ./package.json
COPY apps/api/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
  && chown -R nodejs:nodejs /app
WORKDIR /app/apps/api
USER nodejs
ENV NODE_ENV=production
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

FROM node:24-alpine AS build

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src/ ./src/
COPY seeders/ ./seeders/
COPY migrations/ ./migrations/
RUN npm run build

RUN npm ci --omit=dev

FROM node:24-alpine AS production

RUN apk add --no-cache tini wget

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${APP_PORT:-8000}/api || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/src/main"]

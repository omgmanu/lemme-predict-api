FROM node:20-alpine AS base

RUN apk add --no-cache curl

FROM base AS builder

RUN apk add --no-cache gcompat
WORKDIR /app

COPY package*.json tsconfig.json ./
COPY src ./src

RUN npm ci && \
    npm run build && \
    npm prune --production

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

COPY --from=builder --chown=hono:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=hono:nodejs /app/dist /app/dist
COPY --from=builder --chown=hono:nodejs /app/package.json /app/package.json

USER hono
EXPOSE ${PORT}

# CMD ["node", "/app/dist/index.js"]
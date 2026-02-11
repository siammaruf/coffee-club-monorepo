# ============================================================
# Stage 1: Install all dependencies (needed for build)
# ============================================================
FROM oven/bun:latest AS deps

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

# ============================================================
# Stage 2: Build the SSR application
# ============================================================
FROM oven/bun:latest AS builder

WORKDIR /app

# Vite bakes VITE_ env vars at build time
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
RUN bun run build

# ============================================================
# Stage 3: Production dependencies only
# ============================================================
FROM oven/bun:latest AS prod-deps

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile --production

# ============================================================
# Stage 4: Production runtime
# ============================================================
FROM node:24-alpine AS production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["node", "build/server/index.js"]

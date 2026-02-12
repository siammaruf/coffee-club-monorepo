# ============================================================
# Stage 1: Base with system dependencies (shared)
# ============================================================
FROM oven/bun:latest AS base
RUN apt-get update && apt-get install -y libvips-dev build-essential python3 --no-install-recommends && rm -rf /var/lib/apt/lists/*

# ============================================================
# Stage 2: Install all dependencies (including dev for build)
# ============================================================
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --frozen-lockfile

# ============================================================
# Stage 3: Production dependencies only (parallel with deps)
# ============================================================
FROM base AS prod-deps
WORKDIR /app
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --frozen-lockfile --production

# ============================================================
# Stage 4: Build the application
# ============================================================
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# ============================================================
# Stage 5: Production runtime
# ============================================================
FROM node:24-alpine AS production

# sharp runtime dependency (without -dev headers)
RUN apk add --no-cache vips

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Create uploads directory (mount persistent volume here in Dokploy)
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app/uploads

COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:3000/api/v1/docs || exit 1

ENTRYPOINT ["./entrypoint.sh"]

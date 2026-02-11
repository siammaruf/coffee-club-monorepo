# ============================================================
# Stage 1: Install all dependencies (including dev for build)
# ============================================================
FROM node:24-alpine AS deps

WORKDIR /app

# sharp requires vips native libraries on Alpine
RUN apk add --no-cache vips-dev build-base python3

COPY package.json package-lock.json* ./

RUN if [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

# ============================================================
# Stage 2: Build the application
# ============================================================
FROM node:24-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ============================================================
# Stage 3: Production dependencies only
# ============================================================
FROM node:24-alpine AS prod-deps

WORKDIR /app

# sharp needs vips-dev at install time for native bindings
RUN apk add --no-cache vips-dev build-base python3

COPY package.json package-lock.json* ./

RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev; \
    else \
      npm install --omit=dev; \
    fi

# ============================================================
# Stage 4: Production runtime
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

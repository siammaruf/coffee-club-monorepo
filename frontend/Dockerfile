# ============================================================
# Stage 1: Install dependencies
# ============================================================
FROM node:24-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* .npmrc* ./

RUN if [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

# ============================================================
# Stage 2: Build the SPA
# ============================================================
FROM node:24-alpine AS builder

WORKDIR /app

# Vite bakes VITE_ env vars at build time
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ============================================================
# Stage 3: Serve with Node.js + serve
# ============================================================
FROM node:24-alpine AS production

RUN npm install -g serve

WORKDIR /app

COPY --from=builder /app/dist ./dist

RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["serve", "-s", "dist", "-l", "3000"]

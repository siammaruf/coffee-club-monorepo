# Dependencies
FROM oven/bun:latest AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --no-frozen-lockfile

# Build (Node.js needed — react-router executes server bundle to generate SPA index.html)
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx react-router build

# Runtime
FROM oven/bun:latest
WORKDIR /app
COPY --from=builder /app/build/client ./build/client
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000').then(() => process.exit(0)).catch(() => process.exit(1))" || exit 1
ENTRYPOINT ["/app/entrypoint.sh"]

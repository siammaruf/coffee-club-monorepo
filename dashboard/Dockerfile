# Dependencies
FROM oven/bun:latest AS deps
WORKDIR /app
COPY package.json package-lock.json* bun.lockb* ./
RUN bun install --frozen-lockfile

# Build
FROM oven/bun:latest AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

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
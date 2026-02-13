# ==========================================
# Stage 1: Build Stage
# ==========================================
FROM oven/bun:latest AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* package-lock.json* ./

# Install dependencies with Bun (includes devDependencies needed for build)
# Note: Will generate bun.lockb if it doesn't exist from package-lock.json
RUN bun install

# Copy source code
COPY . .

# Build NestJS application
RUN bun run build

# ==========================================
# Stage 2: Production Runtime
# ==========================================
FROM oven/bun:latest AS runtime

# Install Node.js 24, npm, and PostgreSQL client
RUN apt-get update && apt-get install -y \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 24 via nodesource
RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependencies and build from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Copy source files needed for migrations(TypeScript files)
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Copy entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose backend port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD bun --eval "fetch('http://localhost:3000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start backend with migrations and seeds
ENTRYPOINT ["/app/entrypoint.sh"]
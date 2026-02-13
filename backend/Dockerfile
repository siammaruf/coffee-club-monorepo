FROM oven/bun:latest AS builder

WORKDIR /app
COPY package.json bun.lockb* package-lock.json* ./
RUN bun install
COPY . .
RUN bun run build


FROM oven/bun:latest

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
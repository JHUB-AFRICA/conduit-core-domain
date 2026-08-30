FROM node:20-slim AS base

FROM base AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* vars must be present at build time — they get baked into
# the client bundle. Pass them in with --build-arg.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build


FROM base AS runner

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

WORKDIR /app

# Create non-root user (mirrors the backend Dockerfile)
RUN useradd --create-home appuser

# `output: "standalone"` in next.config.js traces only the files actually
# needed at runtime, so we don't have to copy node_modules at all.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=appuser:appuser /app/.next/standalone ./
COPY --from=builder --chown=appuser:appuser /app/.next/static ./.next/static

USER appuser

EXPOSE 3000

CMD ["node", "server.js"]

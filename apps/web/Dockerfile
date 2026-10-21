# ==========================================
# 1. Base Image
# ==========================================
FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable


# ==========================================
# 2. Dependencies & Builder Stage
# ==========================================
FROM base AS builder

WORKDIR /app

# Required for native Node modules
RUN apk add --no-cache libc6-compat

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./

# Copy packages, Prisma, and Web app
COPY packages/ ./packages/
COPY prisma/ ./prisma/
COPY apps/web/ ./apps/web/

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --no-frozen-lockfile

# Generate Prisma Client
RUN npx prisma generate

# Build shared types package
RUN npx tsc -p packages/types/tsconfig.json


# ==========================================
# Build-time Environment Variables
# ==========================================
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_URL
ARG DATABASE_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV DATABASE_URL=$DATABASE_URL


# ==========================================
# Build the Next.js app
# ==========================================
RUN pnpm --filter web build


# ==========================================
# 3. Production Runner Stage
# ==========================================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs \
    /app/apps/web/.next/standalone ./

# Copy static files
COPY --from=builder --chown=nextjs:nodejs \
    /app/apps/web/.next/static ./apps/web/.next/static

# Copy public files
COPY --from=builder --chown=nextjs:nodejs \
    /app/apps/web/public ./apps/web/public

# Run as non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
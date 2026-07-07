# Multi-stage build for production optimization
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Builder stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production runner stage
FROM base AS runner
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

COPY --from=builder --chown=expressjs:nodejs /app/dist ./dist
COPY --from=builder --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=expressjs:nodejs /app/package.json ./package.json

# Create uploads directory
RUN mkdir -p /app/uploads && chown expressjs:nodejs /app/uploads
RUN mkdir -p /app/logs && chown expressjs:nodejs /app/logs

USER expressjs
EXPOSE 5000
ENV PORT 5000

CMD ["node", "dist/server.js"]

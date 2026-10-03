# ChatScale backend — one image, run as many copies as you like.
#   docker build -t chatscale-backend ./backend
# Configuration comes from environment variables at run time (see .env.example); no secrets are
# baked into the image.

# ---- Stage 1: install production dependencies ----
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---- Stage 2: the runtime image ----
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production \
    PORT=5001

COPY --from=deps /app/node_modules ./node_modules
COPY package.json server.js ./
COPY src ./src
COPY scripts ./scripts

# Run as the unprivileged "node" user that the base image provides, not root
USER node

EXPOSE 5001

# Docker marks the container unhealthy if the process stops answering (Kubernetes uses its own probes)
HEALTHCHECK --interval=10s --timeout=3s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}/healthz >/dev/null || exit 1

# Node runs as PID 1 and handles SIGTERM itself (graceful shutdown in src/lifecycle.js)
CMD ["node", "server.js"]

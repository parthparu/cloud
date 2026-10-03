# ChatScale web — the React app plus the load balancer in front of the backend copies.
#   docker build -t chatscale-web ./frontend

# ---- Stage 1: build the React app into static files ----
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY public ./public
COPY src ./src
# Empty = call the backend on the same address that served the page (nginx forwards it)
ARG REACT_APP_API_URL=""
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# ---- Stage 2: nginx serves the files and forwards API/WebSocket traffic ----
# The unprivileged variant runs as a normal user and listens on 8080
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/nginx-health >/dev/null || exit 1

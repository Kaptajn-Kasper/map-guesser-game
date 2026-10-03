# Stage 1: build the Angular application
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY . .
RUN npm run build -- --configuration production

# Stage 2: serve with unprivileged nginx (runs as uid 101, listens on 8080).
# The container runs with a read-only rootfs; nginx and the runtime config
# script only write to /tmp.
FROM nginxinc/nginx-unprivileged:alpine

COPY --from=build /app/dist/map-guesser-game/browser /usr/share/nginx/html
COPY nginx/production.nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://127.0.0.1:8080/ || exit 1

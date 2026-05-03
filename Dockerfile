# ═══════════════════════════════════════════════════════════════════════
#  Daleel Reporter — Frontend Dockerfile (TanStack Start SSR)
# ═══════════════════════════════════════════════════════════════════════
#
#  This app uses TanStack Start + Cloudflare Vite Plugin.
#  `vite preview` launches miniflare/workerd which binds to 127.0.0.1
#  and is NOT Docker-friendly. We use `vite dev` instead, where the
#  Cloudflare plugin is build-only and Vite's dev server properly
#  respects --host 0.0.0.0.
#
#  Build context: repo root (d:\Freelance\daleel-repoerter)
# ═══════════════════════════════════════════════════════════════════════

FROM node:22-alpine

WORKDIR /app

# Copy package manifests first (Docker layer caching)
COPY client/package.json client/package-lock.json ./

# Install all dependencies
RUN npm install

# Copy the rest of the frontend source code
COPY client/ ./

# Copy the root .env file into the parent dir (vite.config envDir: "../")
COPY .env ../.env

# Expose the Vite dev server port
EXPOSE 5173

# Force Vite to bind to all interfaces so Docker port mapping works
ENV HOST=0.0.0.0

# Run the Vite dev server, accessible from outside the container
CMD ["npx", "vite", "dev", "--host", "0.0.0.0", "--port", "5173"]

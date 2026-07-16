# ─────────────────────────────────────────────
# Stage 1: Build admin panel (React/Vite)
# ─────────────────────────────────────────────
FROM node:20-alpine AS admin-builder

WORKDIR /app/admin

COPY admin/package*.json ./
RUN npm ci --legacy-peer-deps

COPY admin/ .

# VITE_API_URL is baked in at build time
ARG VITE_API_URL=https://parvane-backend.onrender.com/api/v1
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Build backend (NestJS)
# ─────────────────────────────────────────────
FROM node:20-alpine AS backend-builder

RUN corepack enable && corepack prepare yarn@1.22.22 --activate

WORKDIR /app/backend

COPY backend/package.json ./
RUN yarn install --network-timeout 300000

COPY backend/ .
RUN yarn build

# ─────────────────────────────────────────────
# Stage 3: Production image
# ─────────────────────────────────────────────
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare yarn@1.22.22 --activate

WORKDIR /app

COPY backend/package.json ./
RUN yarn install --production=true --network-timeout 300000

# Backend compiled output
COPY --from=backend-builder /app/backend/dist ./dist

# Admin panel static build → served at /admin by NestJS
COPY --from=admin-builder /app/admin/dist ./admin-dist

EXPOSE 3000

CMD ["node", "dist/main"]

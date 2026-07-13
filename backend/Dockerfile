FROM node:20-alpine AS builder

# bcrypt is a native module and needs a real toolchain to compile on Alpine (musl);
# without these, npm ci silently produces a broken node_modules and later steps
# (like `nest build`) fail with confusing "not found" errors.
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS production

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]

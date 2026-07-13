FROM node:20-alpine AS builder

# npm hits a reproducible "Exit handler never called!" race on Render's build
# hosts (consistently ~70-75s into any npm ci/install, regardless of package
# set, optional deps, or region) that silently produces an incomplete
# node_modules while still reporting success. yarn does not share this code
# path, so it is used here instead of npm.
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

WORKDIR /app

COPY package.json ./
RUN yarn install --network-timeout 300000

COPY . .
RUN yarn build

FROM node:20-alpine AS production

RUN corepack enable && corepack prepare yarn@1.22.22 --activate

WORKDIR /app

COPY package.json ./
RUN yarn install --production=true --network-timeout 300000

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]

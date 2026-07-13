FROM node:20-alpine AS builder

# Disable npm's "new version available" notifier: it makes a background network
# call that can race with npm's own exit handler on slower build machines,
# producing "Exit handler never called!" and a silently incomplete node_modules
# (later steps then fail with confusing "not found" errors).
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_AUDIT=false

WORKDIR /app

COPY package*.json ./
# `npm ci` has a known race ("Exit handler never called!") on some constrained/
# proxied build hosts (reproduced consistently on Render's builders) that leaves
# node_modules silently incomplete while still reporting success. `npm install`
# does not hit the same code path, so it is used here instead.
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine AS production

ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_AUDIT=false

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]

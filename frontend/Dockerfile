# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci && npx update-browserslist-db@latest -y && rm -rf ./node_modules/.cache

COPY . .

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app .

RUN apk update && apk --no-cache add curl

EXPOSE 3000

CMD ["npm", "run", "dev"]

HEALTHCHECK --interval=30m --timeout=10s \
  CMD curl -f http://localhost:3000 || exit 1

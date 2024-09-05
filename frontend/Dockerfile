# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci && npx update-browserslist-db@latest -y && rm -rf ./node_modules/.cache

COPY . .

# Runtime stage
FROM node:20-alpine

# Create the app directory and change ownership upfront
WORKDIR /app

COPY --from=builder /app .

# Install curl for health checking
RUN apk update && apk --no-cache add curl

EXPOSE 3000

CMD ["npm", "run", "dev"]

HEALTHCHECK --interval=30m --timeout=10s \
  CMD curl -f http://localhost:3000 || exit 1

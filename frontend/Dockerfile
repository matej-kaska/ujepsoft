# Build stage
FROM node:20.8.0-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci && rm -rf ./node_modules/.cache

COPY . .

# Runtime stage
FROM node:20.8.0-alpine

# Install curl for health checking
RUN apk update && apk --no-cache add curl

WORKDIR /app

COPY --from=builder /app .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Add a health check
HEALTHCHECK --interval=5m --timeout=10s \
  CMD curl -f http://localhost:3000 || exit 1

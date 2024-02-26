# Build stage
FROM node:20.8.0-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci && rm -rf ./node_modules/.cache

COPY . .

# Runtime stage
FROM node:20.8.0-alpine

WORKDIR /app

COPY --from=builder /app .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Install curl for health checking
RUN apk --no-cache add curl

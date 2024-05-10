# Build stage
FROM node:20.8.0-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci && rm -rf ./node_modules/.cache

# Install curl for health checking
RUN apk update && apk --no-cache add curl

COPY . .

# Runtime stage
FROM node:20.8.0-alpine

# Create the app directory and change ownership upfront
WORKDIR /app
RUN adduser -D ujepsoft && chown -R ujepsoft:ujepsoft /app

# Use the non-root user
USER ujepsoft

COPY --from=builder /app .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Add a health check
HEALTHCHECK --interval=5m --timeout=10s \
  CMD curl -f http://localhost:3000 || exit 1

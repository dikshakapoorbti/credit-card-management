# Backend Dockerfile for Production
# Using Debian-based image for OpenSSL compatibility with Prisma
FROM node:18-slim

# Install OpenSSL (required for Prisma)
RUN apt-get update -y && apt-get install -y openssl libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY src ./src/

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]

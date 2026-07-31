# Stage 1: Build & Dependencies
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2: Production Run
FROM node:22-alpine AS production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./
COPY openapi.json ./
COPY src/ ./src/

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]

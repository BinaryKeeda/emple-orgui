# ---------- Build stage ----------
FROM node:20-slim AS build

WORKDIR /app

# Copy dependency files first (better caching)
COPY package.json yarn.lock ./

RUN yarn

# Copy source
COPY . .

# Build-time env vars (Vite reads these)
ARG VITE_PORT
ARG VITE_API_BASE_URL
ARG VITE_MESSAGE_QUEUE_URL
ARG VITE_CODE_EXECUTION_API
ARG VITE_PAYMENT_KEY
ARG VITE_PAYMENT_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_MODE
ENV VITE_PORT=$VITE_PORT \
    VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_MESSAGE_QUEUE_URL=$VITE_MESSAGE_QUEUE_URL \
    VITE_CODE_EXECUTION_API=$VITE_CODE_EXECUTION_API \
    VITE_PAYMENT_KEY=$VITE_PAYMENT_KEY \
    VITE_PAYMENT_URL=$VITE_PAYMENT_URL \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
    VITE_MODE=$VITE_MODE

RUN yarn build


# ---------- Runtime stage ----------
FROM nginx:alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

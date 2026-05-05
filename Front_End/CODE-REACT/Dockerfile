# Stage 1: Build the React Application
FROM node:20-alpine AS build
WORKDIR /app
# K8s / same-host nginx proxy: use /api so the browser talks to the UI origin only.
# Override for local images, e.g. --build-arg VITE_API_URL=http://host.docker.internal:3000/api
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
COPY package*.json ./
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx for maximum performance
FROM nginx:alpine
# Vite outputs to 'dist' by default (unlike CRA which uses 'build')
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

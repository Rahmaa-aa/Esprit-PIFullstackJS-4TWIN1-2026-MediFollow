# Stage 1: Build the React Application
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx for maximum performance
FROM nginx:alpine
# Vite outputs to 'dist' by default (unlike CRA which uses 'build')
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

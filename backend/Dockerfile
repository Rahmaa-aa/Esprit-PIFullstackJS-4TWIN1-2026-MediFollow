FROM node:20-alpine
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# Start the NestJS production server
CMD ["npm", "run", "start:prod"]
EXPOSE 3000

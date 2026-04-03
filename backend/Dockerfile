FROM node:20-alpine
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Start the NestJS production server
CMD ["npm", "run", "start:prod"]
EXPOSE 3000

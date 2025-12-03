FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source
COPY src ./src
COPY index.html ./
COPY vite.config.js ./

# Build client
RUN npm run build

EXPOSE 8080

CMD ["node", "src/server/index.js"]

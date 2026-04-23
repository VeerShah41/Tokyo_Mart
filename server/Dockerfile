FROM node:18-alpine

WORKDIR /app

# Copy package files and prisma schema first for postinstall generation
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (this will also trigger prisma generate via postinstall)
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the server port
EXPOSE 5001

# Start the server
CMD ["npm", "start"]

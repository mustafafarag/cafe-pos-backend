# Use an official Node.js image
FROM node:20-slim

# Update and install security updates
RUN apt-get update && apt-get upgrade -y && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory inside the container
WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project
COPY . .

# Expose app port
EXPOSE 3000

# Default command will be overridden by docker-compose
CMD ["npm", "run" , "server"]

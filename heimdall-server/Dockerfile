# Use Node.js 20 as the base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files and npmrc
COPY package*.json .npmrc ./

# Install dependencies (the GITHUB_TOKEN build arg will be used by .npmrc)
ARG GITHUB_TOKEN
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Remove .npmrc for security
RUN rm -f .npmrc

# Expose the port the app runs on
EXPOSE 4000

# Command to run the application
CMD ["npm", "start"] 
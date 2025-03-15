# Use the official Node.js v20.10.0 image as the base image
FROM node:20.10.0-alpine

# Install curl and other dependencies during the build (using apk for Alpine Linux)
RUN apk add --no-cache curl

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json first for better layer caching
COPY package*.json ./

# Copy the scripts folder separately since it's outside /app
COPY scripts/ /scripts

# Install the project dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port that the Next.js app will run on
EXPOSE 3001

# Build and start the Next.js app
CMD ["npm", "run", "dev"]

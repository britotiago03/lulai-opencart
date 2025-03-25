# Use official Node.js image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy everything into the container
COPY . .

# Expose port 3000 for Next.js
EXPOSE 3002

# Start Next.js app
CMD ["npm", "run", "dev"]

# 1. Use the official Node image
FROM node:18-alpine

# 2. Set the working directory inside the container box
WORKDIR /app

# 3. Copy package files first to speed up future container builds using Docker caching
COPY package*.json ./

# 4. Install production dependencies
RUN npm install

# 5. Copy your Next.js application files
COPY . .

# 6. Inform Docker that the Next.js development/production server runs on port 3000
EXPOSE 3000

# 7. Start the Next.js local server
CMD ["npm", "run", "dev"]
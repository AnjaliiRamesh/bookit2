# 1. Start with an official, lightweight operating system image that already has Node.js installed
FROM node:18-alpine

# 2. Create a secure folder inside the container where our code will live
WORKDIR /app

# 3. Copy your dependency manifests first (package.json and package-lock.json)
COPY package*.json ./

# 4. Install your node packages directly inside the container environment
RUN npm install

# 5. Copy the rest of your local backend source code files into the container
COPY . .

# 6. Generate your Prisma client binaries so your database queries are type-safe
RUN npx prisma generate

# 7. Inform Docker that the container will listen for network requests on port 5000
EXPOSE 5000

# 8. Define the default execution command that starts your server engine when the container wakes up
CMD ["npm", "run", "start"]
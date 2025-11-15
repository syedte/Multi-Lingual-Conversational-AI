# server/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy only manifest files first (better layer caching)
COPY package*.json ./

# Use a more forgiving install than `npm ci`
RUN npm install --omit=dev

# Now copy the rest of the server code
COPY . .

ENV PORT=3001
EXPOSE 3001

CMD ["node", "server.js"]
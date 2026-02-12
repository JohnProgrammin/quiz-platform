FROM node:20-alpine

WORKDIR /app

# Copy backend source
COPY backend ./backend

# Install backend dependencies
WORKDIR /app/backend
RUN npm install --production

# Go back to app root
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start backend server
CMD ["node", "backend/server.js"]

FROM node:20-alpine

WORKDIR /app

# Install dependencies for both backend and frontend
COPY package*.json ./
RUN npm install || true

# Copy backend
COPY backend ./backend
RUN cd backend && npm install --production 2>/dev/null || true

# Copy frontend source (for potential reference)
COPY frontend ./frontend

# Set environment to production
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start backend server
CMD ["node", "backend/server.js"]

# Dùng Node.js LTS
FROM node:18-alpine

# Thư mục làm việc trong container
WORKDIR /app

# Copy file package trước để tận dụng cache
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

# Build app Next.js
RUN npm run build

# Expose port mặc định của Next.js
EXPOSE 3000

# Chạy app ở production
CMD ["npm", "run", "start"]

#  docker build --build-arg NEXT_PUBLIC_BASE_URL=https://qldapm-backend.onrender.com/api/v1 -t app .
# docker run -p 3000:3000 app  
# Stage 1: Build ứng dụng React bằng Vite
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy source code
COPY . .

# Build dự án (kết quả nằm trong thư mục dist)
RUN npm run build

# Stage 2: Nginx phục vụ static files và routing SPA
FROM nginx:alpine AS runner

# Sao chép file cấu hình nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Sao chép file đã build từ builder sang nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

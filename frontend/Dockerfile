# Step 1: Frontend app ko build karna
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Step 2: Nginx server ke zariye build folder ko serve karna
FROM nginx:alpine

# Vite / React ka production build dist folder mein banta hai
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
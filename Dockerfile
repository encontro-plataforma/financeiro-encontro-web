FROM node:20-slim AS build

ARG API_URL=http://localhost:8000

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN sed -i "s|##API_URL##|${API_URL}|g" src/environments/environment.prod.ts

RUN npm run build

# ---

FROM nginx:alpine

COPY --from=build /app/dist/financeiro-encontro/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

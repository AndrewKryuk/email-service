FROM node:20.11.1-alpine AS builder

WORKDIR /opt/app

COPY package*.json .
COPY tsconfig*.json .
COPY nest-cli.json .
COPY src/ src
COPY database/ database

RUN npm ci

RUN npm run build

FROM node:20.11.1-alpine

WORKDIR /opt/app

# Копируем зависимости и билд из builder stage
COPY --from=builder /opt/app/node_modules ./node_modules
COPY --from=builder /opt/app/package*.json ./
COPY --from=builder /opt/app/dist ./dist
COPY --from=builder /opt/app/database ./database

EXPOSE 3000

CMD [ "npm", "run", "start:prod" ]
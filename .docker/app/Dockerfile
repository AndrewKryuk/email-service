FROM node:20.11.1-alpine

RUN apk add git

WORKDIR /app

COPY . .

RUN npm ci

CMD [ "npm", "run", "start:docker" ]

FROM node:16-bullseye-slim

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm ci
# Bundle app source
COPY . .

EXPOSE 5656
ENTRYPOINT [ "npm", "start" ]

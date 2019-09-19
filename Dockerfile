FROM node:alpine

WORKDIR /adapter
ADD . .

ENV EA_PORT=8080

RUN npm install
CMD node app.js

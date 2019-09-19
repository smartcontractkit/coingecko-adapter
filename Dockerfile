FROM node:alpine

WORKDIR /adapter
ADD . .

ENV EA_PORT=80

RUN npm install
ENTRYPOINT ["node", "app.js"]

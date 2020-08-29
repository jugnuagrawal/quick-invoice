FROM node:10-alpine

COPY package.json package.json

RUN npm i

COPY . .

EXPOSE 3300

CMD [ "node", "app.js"]
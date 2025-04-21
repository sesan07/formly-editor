FROM node:22.14-alpine as build-env

WORKDIR /app

COPY ./package.json .
COPY ./package-lock.json .
RUN npm ci

COPY ./projects/ ./projects
COPY ./src ./src
COPY ./angular.json .
COPY ./tsconfig.json .
COPY ./tsconfig.app.json .

CMD [ "npm", "start" ]

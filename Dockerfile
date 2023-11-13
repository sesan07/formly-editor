FROM node:18.18-alpine as build-env

WORKDIR /app

COPY ./package.json .
COPY ./package-lock.json .
RUN npm ci

COPY ./projects/ ./projects
COPY ./src ./src
COPY ./angular.json .
COPY ./tsconfig.json .
COPY ./tsconfig.app.json .
RUN npm run build

FROM nginx:latest

COPY --from=build-env /app/dist/formly-editor /usr/share/nginx/html
COPY ./nginx/default.conf.template /etc/nginx/templates/

EXPOSE 80
FROM node:22.14-alpine AS build-env

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

COPY --from=build-env /app/dist/formly-editor/browser /usr/share/nginx/html
COPY ./nginx/default.conf.template /etc/nginx/templates/

EXPOSE 80
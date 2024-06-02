FROM node:18.20-alpine as build-env

WORKDIR /app

# temporarily patch ngx-formly until it supports standalone components
COPY ./patches ./patches
COPY ./package.json .
COPY ./package-lock.json .
# temporarily use '--legacy-peer-deps' until ngrx supports Angular 18
RUN npm ci --legacy-peer-deps

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
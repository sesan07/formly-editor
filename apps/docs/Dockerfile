FROM nginx:alpine
RUN apk add --no-cache tzdata curl && rm -rf /usr/share/nginx/html/*
COPY dist/apps/docs/ /usr/share/nginx/html/
COPY apps/docs/nginx/default.conf.template /etc/nginx/templates/default.conf.template
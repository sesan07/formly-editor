FROM nginx:alpine
RUN apk add --no-cache tzdata curl && rm -rf /usr/share/nginx/html/*
COPY dist/apps/studio/browser/ /usr/share/nginx/html/
COPY apps/studio/nginx/default.conf.template /etc/nginx/templates/default.conf.template
RUN find /usr/share/nginx/html -type f -name '*.map' -delete
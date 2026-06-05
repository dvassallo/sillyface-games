FROM node:20-alpine AS build

WORKDIR /apps
COPY . .
RUN node scripts/generate-root.mjs

FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /apps /usr/share/nginx/apps

EXPOSE 80

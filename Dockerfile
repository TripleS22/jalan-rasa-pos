# syntax=docker/dockerfile:1

# ---- Frontend build ----
FROM node:22-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- PHP dependencies ----
FROM composer:2 AS vendor
WORKDIR /app
COPY database ./database
COPY composer.json composer.lock ./
# Keep dev deps (fakerphp/faker) — this image seeds demo data on boot.
RUN composer install --no-interaction --optimize-autoloader --no-scripts --no-progress

# ---- Runtime ----
FROM php:8.4-fpm-alpine

RUN apk add --no-cache nginx supervisor sqlite-libs icu-libs libzip \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS sqlite-dev icu-dev oniguruma-dev libzip-dev \
    && docker-php-ext-install pdo pdo_sqlite bcmath mbstring zip intl opcache \
    && apk del .build-deps

WORKDIR /app
COPY . .
COPY --from=vendor /app/vendor ./vendor
COPY --from=frontend /app/public/build ./public/build

RUN mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/testing storage/framework/views storage/logs bootstrap/cache database \
    && touch database/database.sqlite \
    && chown -R www-data:www-data storage bootstrap/cache database \
    && chmod -R 775 storage bootstrap/cache database

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

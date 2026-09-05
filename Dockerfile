# syntax=docker/dockerfile:1

##########################################################################
# Stage 0 — Base PHP 8.4 (extensiones + libs de sistema)
#
# La reutilizan 'vendor', 'assets' y 'app': así las extensiones se compilan
# una sola vez y artisan bootea igual en build y en runtime.
##########################################################################
FROM php:8.4-fpm-bookworm AS base

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        git curl unzip ca-certificates gnupg \
        libzip-dev libpng-dev libjpeg-dev libfreetype6-dev libwebp-dev libonig-dev libicu-dev; \
    # GD con soporte WebP: ProductImageService convierte todas las fotos a .webp.
    docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp; \
    docker-php-ext-install -j"$(nproc)" pdo_mysql gd zip intl bcmath exif opcache; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*

COPY docker/php/php.ini /usr/local/etc/php/conf.d/zzz-app.ini

WORKDIR /var/www/html

##########################################################################
# Stage 1 — Dependencias PHP (Composer, sin dev)
#
# Corre sobre 'base' (PHP 8.4) para no chocar con el require "php": "^8.4".
##########################################################################
FROM base AS vendor
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY composer.json composer.lock ./
RUN composer install \
      --no-dev --no-scripts --no-autoloader \
      --prefer-dist --no-interaction --no-progress
COPY . .
RUN composer dump-autoload --optimize --classmap-authoritative --no-dev

##########################################################################
# Stage 2 — Frontend assets (Vite build con npm)
#
# Necesita PHP + vendor: el plugin Wayfinder corre `php artisan
# wayfinder:generate` durante el build, y esos archivos están gitignoreados
# (no vienen en el clone), así que hay que regenerarlos acá.
##########################################################################
FROM base AS assets
# Node 22 sobre la base PHP (para que artisan esté disponible en el build).
RUN set -eux; \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -; \
    apt-get install -y --no-install-recommends nodejs; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*
# APP_KEY de descarte: solo para que artisan bootee y liste rutas en el build.
ENV APP_ENV=production \
    APP_KEY=base64:c2VjcmV0LWtleS1zb2xvLXBhcmEtZWwtYnVpbGQtMDAwMDA=
COPY package.json package-lock.json ./
RUN npm ci
COPY --from=vendor /var/www/html/vendor ./vendor
COPY . .
RUN npm run build

##########################################################################
# Stage 3 — Runtime (PHP-FPM)
##########################################################################
FROM base AS app

# Código + vendor optimizado + assets compilados por Vite.
COPY --chown=www-data:www-data . .
COPY --from=vendor --chown=www-data:www-data /var/www/html/vendor       ./vendor
COPY --from=assets --chown=www-data:www-data /var/www/html/public/build ./public/build

# storage/ y bootstrap/cache deben ser escribibles por www-data. El .env real
# lo inyecta docker-compose (env_file); se borra cualquiera horneado por error.
RUN chown -R www-data:www-data storage bootstrap/cache \
    && rm -f /var/www/html/.env

COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

USER www-data

ENTRYPOINT ["entrypoint"]
CMD ["php-fpm"]

##########################################################################
# Stage 4 — Nginx con los estáticos de public/ horneados
##########################################################################
FROM nginx:1.27-alpine AS web
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
# Estáticos de public/ (favicon, index.php para try_files, imágenes de marca).
COPY public /var/www/html/public
# Bundle Vite compilado.
COPY --from=assets /var/www/html/public/build /var/www/html/public/build

#!/bin/sh
set -e

cd /app

# Demo deploy: SQLite file lives on the container's local (ephemeral) disk,
# so it starts empty on every fresh deploy. Recreate + migrate + seed so
# there's always example data to look at.
if [ ! -f database/database.sqlite ]; then
    touch database/database.sqlite
fi

chown www-data:www-data database/database.sqlite

php artisan config:clear
php artisan package:discover --ansi
php artisan migrate --force

if [ ! -f storage/.seeded ]; then
    php artisan db:seed --force
    touch storage/.seeded
fi

php artisan config:cache
php artisan route:cache
php artisan view:cache

exec "$@"

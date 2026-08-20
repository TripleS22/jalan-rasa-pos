#!/bin/sh
# Packages the app for shared hosting with no SSH/document-root control
# (InfinityFree and similar). Run from the repo root AFTER `composer install`
# (with dev deps, for fakerphp/faker — this deploy seeds demo data) and
# `npm run build`.
#
# Produces:
#   dist/htdocs/   -> upload to the (sub)domain's web root
#   dist/laravel/  -> upload to a SIBLING folder, NOT web-accessible
#
# index.php is patched to load the app from ../laravel/ instead of the
# usual ../ (since laravel/ is a sibling of htdocs/, not its parent), and
# path.public is rebound so Vite's manifest lookup and any public_path()
# calls resolve to htdocs/ instead of the (nonexistent here) laravel/public.
set -eu

ROOT="$(pwd)"
DIST="$ROOT/dist"

rm -rf "$DIST"
mkdir -p "$DIST/htdocs" "$DIST/laravel"

# Everything except public/ (which becomes htdocs/) and dev-only cruft.
rsync -a \
    --exclude='/.git' \
    --exclude='/node_modules' \
    --exclude='/tests' \
    --exclude='/dist' \
    --exclude='/public' \
    --exclude='/.env' \
    --exclude='/.env.*' \
    --exclude='/database/*.sqlite' \
    --exclude='/bootstrap/cache/*.php' \
    ./ "$DIST/laravel/"

cp -a public/. "$DIST/htdocs/"

# Patch the entry point to reach vendor/ and bootstrap/app.php one level
# further up (they're in laravel/, a sibling of htdocs/, not its parent),
# and bind path.public so Laravel resolves public assets to htdocs/.
php -r '
    $file = $argv[1];
    $content = file_get_contents($file);
    $content = str_replace(
        "__DIR__.'"'"'/../storage/framework/maintenance.php'"'"'",
        "__DIR__.'"'"'/../laravel/storage/framework/maintenance.php'"'"'",
        $content
    );
    $content = str_replace(
        "__DIR__.'"'"'/../vendor/autoload.php'"'"'",
        "__DIR__.'"'"'/../laravel/vendor/autoload.php'"'"'",
        $content
    );
    $content = str_replace(
        "__DIR__.'"'"'/../bootstrap/app.php'"'"'",
        "__DIR__.'"'"'/../laravel/bootstrap/app.php'"'"'",
        $content
    );
    $content = str_replace(
        "\$app->handleRequest(Request::capture());",
        "\$app->usePublicPath(__DIR__);\n\n\$app->handleRequest(Request::capture());",
        $content
    );
    file_put_contents($file, $content);
' "$DIST/htdocs/index.php"

echo "--- patched dist/htdocs/index.php ---"
cat "$DIST/htdocs/index.php"

# .env for the deployed app, from environment variables set by CI (secrets).
cat > "$DIST/laravel/.env" <<ENVEOF
APP_NAME="${DEPLOY_APP_NAME:-Jalan Rasa POS}"
APP_ENV=production
APP_DEBUG=false
APP_KEY=${DEPLOY_APP_KEY:?DEPLOY_APP_KEY is required}
APP_URL=${DEPLOY_APP_URL:?DEPLOY_APP_URL is required}
SELF_ORDER_URL=${DEPLOY_APP_URL}/order/t
DEPLOY_HOOK_TOKEN=${DEPLOY_HOOK_TOKEN:?DEPLOY_HOOK_TOKEN is required}

DB_CONNECTION=mysql
DB_HOST=${DEPLOY_DB_HOST:?DEPLOY_DB_HOST is required}
DB_PORT=${DEPLOY_DB_PORT:-3306}
DB_DATABASE=${DEPLOY_DB_DATABASE:?DEPLOY_DB_DATABASE is required}
DB_USERNAME=${DEPLOY_DB_USERNAME:?DEPLOY_DB_USERNAME is required}
DB_PASSWORD=${DEPLOY_DB_PASSWORD:?DEPLOY_DB_PASSWORD is required}

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
BROADCAST_CONNECTION=log
LOG_CHANNEL=single
LOG_LEVEL=error
ENVEOF

echo "--- dist ready ---"
du -sh "$DIST/htdocs" "$DIST/laravel"

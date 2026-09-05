#!/bin/sh
set -e

cd /var/www/html

# Solo el contenedor de la app (php-fpm) corre migraciones/cachés. Si algún día
# se agrega un worker de colas, arranca con RUN_MIGRATIONS=false.
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then

  echo "→ Esperando a la base de datos (${DB_HOST}:${DB_PORT:-3306})..."
  tries=0
  until php -r '
      $h=getenv("DB_HOST"); $p=getenv("DB_PORT")?:3306;
      $u=getenv("DB_USERNAME"); $pw=getenv("DB_PASSWORD"); $db=getenv("DB_DATABASE");
      try { new PDO("mysql:host=$h;port=$p;dbname=$db", $u, $pw); exit(0); }
      catch (Exception $e) { exit(1); }
  ' 2>/dev/null; do
    tries=$((tries+1))
    if [ "$tries" -ge 60 ]; then
      echo "✗ La base de datos no respondió tras 60 intentos." >&2
      exit 1
    fi
    sleep 2
  done
  echo "✓ Base de datos lista."

  # El disco 'public' guarda las fotos en storage/app/public. El volumen
  # app_storage arranca vacío y tapa storage/app, así que recreamos las
  # carpetas y el symlink public/storage en cada arranque (idempotente).
  mkdir -p storage/app/public storage/app/private
  php artisan storage:link 2>/dev/null || true

  echo "→ Migrando..."
  php artisan migrate --force --no-interaction

  if [ "${RUN_SEED:-false}" = "true" ]; then
    echo "→ Seed (idempotente: admin + catálogo + settings)..."
    php artisan db:seed --force --no-interaction
  fi

  echo "→ Cacheando config/rutas/vistas..."
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache

  echo "✓ App lista."
fi

exec "$@"

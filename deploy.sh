#!/usr/bin/env bash
#
# Deploy de Panadería Fénix en el VPS (update de código dockerizado).
# Uso:  ./deploy.sh
#
# Trae el último código de main, rebuildea las imágenes, recrea los
# contenedores y verifica que la app responda por dentro y por el dominio.
# Frena en el primer error (set -e).

set -euo pipefail

# Pararse en la carpeta del script, no importa desde dónde se llame.
cd "$(dirname "$0")"

DOMINIO="panaderiafenix.com"
PUERTO_INTERNO="8091"

echo "→ Trayendo el código (main)..."
git pull origin main

echo "→ Buildeando imágenes..."
docker compose build

# El orden importa: nginx se queda arriba mientras la app se recrea y migra, y
# devuelve la pantalla de mantenimiento (503) en vez del error del proxy. Recién
# después se recrea nginx, que tarda un par de segundos.
echo "→ Recreando la app (el sitio muestra mantenimiento mientras tanto)..."
docker compose up -d db app

echo "→ Esperando a que la app responda..."
listo=false
for _ in $(seq 1 40); do
  if docker compose exec -T app php artisan inspire >/dev/null 2>&1; then
    listo=true
    break
  fi
  sleep 3
done

docker compose logs --tail 20 app

if [ "$listo" != true ]; then
  echo "✗ La app no respondió tras 2 minutos. El sitio sigue en mantenimiento." >&2
  exit 1
fi

echo "→ Recreando nginx..."
docker compose up -d web

# La pantalla de mantenimiento vive en la imagen de nginx: si no está, el día
# que la app se caiga el visitante ve el error crudo del proxy.
docker compose exec -T web test -f /var/www/html/public/mantenimiento.html   || echo "⚠ falta la pantalla de mantenimiento en el contenedor web"

echo "== chequeo =="
curl -sI "http://127.0.0.1:${PUERTO_INTERNO}" | head -1 || echo "⚠ no respondió por dentro"
curl -sI "https://${DOMINIO}" | head -1 || echo "⚠ no respondió por el dominio"

echo "✅ Deploy OK"

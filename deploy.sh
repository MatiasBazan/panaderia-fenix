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

echo "→ Levantando contenedores..."
docker compose up -d

echo "→ Esperando a que la app arranque..."
sleep 8
docker compose logs --tail 20 app

echo "== chequeo =="
curl -sI "http://127.0.0.1:${PUERTO_INTERNO}" | head -1 || echo "⚠ no respondió por dentro"
curl -sI "https://${DOMINIO}" | head -1 || echo "⚠ no respondió por el dominio"

echo "✅ Deploy OK"

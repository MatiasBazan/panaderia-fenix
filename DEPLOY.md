# Deploy — Panadería Fénix (Docker, VPS compartido)

App Laravel + Inertia/React, dockerizada para convivir con `espaciodiamond` y
`gestion-mabdev` en el mismo VPS. Comparte el **Caddy** de `espaciodiamond`
(dominios + TLS Let's Encrypt) y expone la web en `127.0.0.1:8091`.

## Arquitectura

```
Internet ─▶ Caddy (espaciodiamond, 80/443)
              └─ panaderiafenix.com ─▶ fenix-web (nginx) ─▶ app (php-fpm) ─▶ db (mysql)
                                                 └─ sirve /storage/* y /build/* estáticos
```

Tres contenedores: `app` (php-fpm, corre migraciones), `web` (nginx),
`db` (MySQL 8 dedicada). Sin worker de colas ni scheduler: la app no los usa.

## Requisitos previos

- DNS: `panaderiafenix.com` (y `www`) apuntando con **A** a la IP del VPS.
- Docker + Compose ya instalados (están).
- La red `espaciodiamond_default` existe (el stack de espaciodiamond está levantado).

## Pasos

### 1. Traer el código

```bash
cd /root
git clone <URL-del-repo> panaderia-fenix
cd panaderia-fenix
```

### 2. Configurar el `.env`

```bash
cp .env.docker.example .env
nano .env          # completar DB_PASSWORD, DB_ROOT_PASSWORD; revisar APP_URL
```

Generar la `APP_KEY` y pegarla en el `.env`:

```bash
docker compose run --rm app php artisan key:generate --show
# copiar el "base64:..." a APP_KEY= en el .env
```

Dejar `RUN_SEED=true` para este primer arranque (carga admin + catálogo).

### 3. Buildear y levantar

```bash
docker compose build
docker compose up -d
docker compose logs -f app     # ver: migró, seedeó, "App lista." Ctrl+C para salir
```

Probar que responde por dentro:

```bash
curl -I http://127.0.0.1:8091        # debe dar 200/302
```

### 4. Enganchar el dominio en el Caddy compartido

Editar el Caddyfile de espaciodiamond y agregar el bloque de la panadería:

```bash
nano /root/espaciodiamond/Caddyfile
```

Agregar al final:

```caddy
panaderiafenix.com {
        encode gzip zstd
        reverse_proxy fenix-web:80
}

www.panaderiafenix.com {
        redir https://panaderiafenix.com{uri} permanent
}
```

Recargar Caddy sin cortar el servicio:

```bash
cd /root/espaciodiamond
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
# si el binario no toma la ruta, reiniciar el contenedor:
# docker compose restart caddy
```

Caddy pide el certificado TLS solo. Verificar:

```bash
curl -I https://panaderiafenix.com
```

### 5. Apagar el seed

Editado el `.env`: `RUN_SEED=false` (para no re-seedear en cada reinicio; igual
es idempotente, pero es lo prolijo). No hace falta rebuild:

```bash
docker compose up -d
```

## Operación

| Acción | Comando |
|---|---|
| Ver logs de la app | `docker compose logs -f app` |
| Actualizar (nuevo código) | `./deploy.sh` (trae main, rebuildea, levanta y verifica) |
| Comando artisan | `docker compose exec app php artisan <cmd>` |
| Crear/editar admin | `docker compose exec app php artisan tinker` |
| Backup de la base | `docker compose exec db mysqldump -ufenix -p"$DB_PASSWORD" panaderia_fenix > backup.sql` |
| Ver fotos subidas | volumen `panaderia-fenix_app_storage` |

## Notas

- **Fotos de producto**: se guardan en el volumen `app_storage` (persisten
  entre rebuilds) y las sirve nginx en `/storage/*`. El admin las sube desde el
  panel; el catálogo arranca sin imágenes (el seed las deja en `null`).
- **HTTPS**: el `.env` fuerza `SESSION_SECURE_COOKIE=true` y la app confía en
  las cabeceras `X-Forwarded-*` de Caddy. Si probás por `http://IP:8091` directo
  no vas a poder loguear (cookie segura) — es lo esperado, entrá por el dominio.
- **Puerto 8091**: elegido porque 8080 (espaciodiamond) y 8090 (mabdev) ya están
  tomados. Cambialo con `APP_PORT` en el `.env` si hiciera falta.
- **Limpieza de disco**: el VPS tenía ~42 GB de build cache viejo. Conviene
  `docker builder prune -f` cada tanto.
```

# PetRadar

## Descripcion

PetRadar es una API REST construida con NestJS para registrar mascotas perdidas y mascotas encontradas. Al crear una mascota encontrada, la API busca automaticamente mascotas perdidas activas dentro de un radio de 500 metros usando PostGIS.

## Tecnologias

- Backend: NestJS, TypeScript, TypeORM
- Base de datos: PostgreSQL con PostGIS
- Cache: Redis
- Telemetria: Azure Application Insights
- Contenedores: Docker y Docker Compose
- CI/CD: GitHub Actions y GitHub Container Registry
- Hosting: pendiente de URL final de produccion

## URL Publica

Pendiente de reemplazar despues del despliegue:

- API: `https://TU-URL-PUBLICA`
- Health check: `https://TU-URL-PUBLICA/health`
- Mascotas perdidas activas: `https://TU-URL-PUBLICA/lost-pets`
- Mascotas encontradas: `https://TU-URL-PUBLICA/found-pets`

## Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| `GET` | `/health` | Verifica que la API y la base de datos esten funcionando. |
| `GET` | `/lost-pets` | Lista mascotas perdidas activas usando cache Redis. |
| `POST` | `/lost-pets` | Crea una mascota perdida activa. |
| `GET` | `/found-pets` | Lista mascotas encontradas usando cache Redis. |
| `POST` | `/found-pets` | Crea una mascota encontrada y busca coincidencias por radio de 500 metros. |

## Health Check

```bash
curl https://TU-URL-PUBLICA/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "database": "connected"
}
```

## Busqueda por Radio

`POST /found-pets` ejecuta una consulta real a PostGIS con `ST_DWithin` y cast a `::geography`, para que el radio se mida en metros:

```sql
ST_DWithin(
  lp.location::geography,
  ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
  500
)
```

La respuesta incluye `matches_found`, `matched_lost_pets` y `distance_meters`.

## Instalacion Local

1. Instalar dependencias:

```bash
npm install
```

2. Crear archivo `.env` con base en `.env.example`.

3. Levantar servicios locales:

```bash
docker compose up --build
```

4. Ejecutar migraciones manualmente si solo levantas Postgres/Redis:

```bash
npm run migration:run
```

5. Ejecutar API en modo desarrollo:

```bash
npm run start:dev
```

## Variables de Entorno

| Variable | Descripcion |
| --- | --- |
| `NODE_ENV` | Ambiente de ejecucion. |
| `PORT` | Puerto HTTP de la API. |
| `DB_HOST` | Host de PostgreSQL/PostGIS. |
| `DB_PORT` | Puerto de PostgreSQL/PostGIS. |
| `DB_USERNAME` | Usuario de base de datos. |
| `DB_PASSWORD` | Password de base de datos. |
| `DB_NAME` | Nombre de base de datos. |
| `DB_SSL` | Usa SSL para base de datos cloud (`true` o `false`). |
| `DATABASE_URL` | Connection string completa de PostgreSQL cloud; alternativa a `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` y `DB_NAME`. |
| `REDIS_HOST` | Host de Redis. |
| `REDIS_PORT` | Puerto de Redis. |
| `REDIS_PASSWORD` | Password de Redis si aplica. |
| `REDIS_TLS` | Usa TLS para Redis cloud (`true` o `false`). |
| `REDIS_URL` | Connection string completa de Redis cloud; alternativa a `REDIS_HOST`, `REDIS_PORT` y `REDIS_PASSWORD`. |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Connection string de Azure Application Insights. |
| `SMTP_HOST` | Host SMTP para notificaciones. |
| `SMTP_PORT` | Puerto SMTP. |
| `SMTP_SECURE` | Conexion SMTP segura (`true` o `false`). |
| `SMTP_USER` | Usuario SMTP. |
| `SMTP_PASS` | Password SMTP. |
| `MAIL_FROM` | Remitente de correos. |
| `NOTIFICATION_EMAIL` | Correo de alertas. |
| `MAPBOX_ACCESS_TOKEN` | Token Mapbox si se usa geocodificacion. |

## Docker

Construir imagen:

```bash
docker build -t pet-radar:local .
```

Ejecutar con Docker Compose:

```bash
docker compose up --build
```

## GitHub Container Registry

El workflow `.github/workflows/docker-ghcr.yml` construye y publica la imagen al hacer push a `main`:

```text
ghcr.io/th3motheralex/petradar:latest
ghcr.io/th3motheralex/petradar:<commit-sha>
```

## Despliegue en Render

El archivo `render.yaml` define:

- Servicio web Docker `petradar-api`.
- PostgreSQL cloud `petradar-db`.
- Redis-compatible Key Value `petradar-redis`.
- Health check en `/health`.
- Variables sensibles con `sync: false` para capturarlas en el dashboard sin subir secretos al repositorio.

Render soporta Blueprints mediante un archivo `render.yaml` en la raiz del repo y permite configurar `healthCheckPath` para servicios web. Render Postgres soporta extensiones como `postgis`, que la migracion inicial habilita con `CREATE EXTENSION IF NOT EXISTS postgis`.

## Evidencia de Despliegue

Para el video final se debe mostrar:

- Repositorio GitHub publico.
- Plataforma cloud donde corre la API.
- Base de datos PostgreSQL/PostGIS cloud.
- Variables de entorno configuradas sin mostrar secretos.
- `GET /health` respondiendo `status: ok`.
- `GET /lost-pets` o `GET /found-pets` devolviendo JSON desde la base cloud.
- `POST /found-pets` devolviendo `matches_found` y `distance_meters`.

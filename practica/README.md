# bildyapp

Practica final de Web II. Api rest del backend de bildyapp (gestor de
albaranes para autonomos y empresas). Construye sobre la practica
intermedia (modulo de usuarios) y añade clientes, proyectos, albaranes
con firma y PDF, swagger y tests.

## Como levantarlo en local

Hace falta node 22+ y una cuenta de mongo atlas.

```
npm install
cp .env.example .env
```

Rellena el `.env` con la uri de mongo y dos secretos para jwt
(`openssl rand -hex 32`). Las variables de cloudinary, smtp y slack
son opcionales: si no estan, el storage hace fallback en memoria,
nodemailer escupe el mail por consola y los errores 5xx solo se
imprimen en log.

```
npm run dev
```

Y queda en http://localhost:3000.

## Documentacion

Una vez arrancado: http://localhost:3000/api-docs (swagger ui con
todos los endpoints, esquemas y posibilidad de probar).

## Tests

```
npm test                 # corre todos
npm run test:coverage    # con cobertura
```

Usan `mongodb-memory-server` asi que no necesitan mongo real.

## Endpoints

Todos los protegidos requieren `Authorization: Bearer <accessToken>`.

### `/api/user`
Lo que ya hicimos en la intermedia (register, login, validation,
onboarding, company, logo, refresh, logout, delete, invite, password).

### `/api/client`
- `POST /` - crear
- `GET /` - listar (paginado: `?page=&limit=`, filtro `?name=`)
- `GET /archived` - archivados
- `GET /:id` - obtener uno
- `PUT /:id` - actualizar
- `DELETE /:id?soft=true|false` - archivar o borrar
- `PATCH /:id/restore` - restaurar archivado

### `/api/project`
- `POST /` - crear (necesita `client` existente)
- `GET /` - listar (`?client=`, `?name=`, `?active=`)
- `GET /archived`
- `GET /:id`, `PUT /:id`, `DELETE /:id?soft=`
- `PATCH /:id/restore`

### `/api/deliverynote`
- `POST /` - crear (`format: hours | material`)
- `GET /` - listar con muchos filtros (`?project=`, `?client=`,
  `?format=`, `?signed=`, `?from=`, `?to=`)
- `GET /:id` - con populate de user / client / project
- `GET /pdf/:id` - descarga PDF (si esta firmado redirige al de la nube)
- `PATCH /:id/sign` - firma con imagen multipart (campo `signature`)
- `DELETE /:id` - solo si NO esta firmado

### `/api/health`
Health check para uptime monitors. Devuelve estado del
proceso y de la conexion a mongo.

## Notas

- El codigo de verificacion del email se envia con nodemailer; en local
  sin SMTP se imprime por consola para poder copiarlo a mano.
- Las firmas se redimensionan con sharp (max 800px de ancho, webp 85%)
  antes de subirse a cloudinary, asi pesan mucho menos.
- El PDF de un albaran firmado se sube tambien a la nube, y la
  descarga (`GET /pdf/:id`) redirige a esa url para no regenerarlo.
- Un albaran firmado no se puede borrar (regla de negocio).
- Los recursos (clients/projects/deliverynotes) son siempre por
  compañia, no por usuario, asi cualquier guest de la misma empresa
  los puede usar.
- El rate limit (100/15min global y 10/15min en login/register) se
  desactiva automaticamente cuando `NODE_ENV=test`.

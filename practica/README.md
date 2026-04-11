# bildyapp

Practica intermedia de Web II. Api rest del modulo de usuarios de bildyapp
(el gestor de albaranes).

## Como levantarlo

Hace falta node 22+ y una cuenta de mongo atlas (con el plan free vale).

```
npm install
cp .env.example .env
```

Rellenar el `.env` con la uri de atlas y dos secretos para jwt (los
generas tu, con `openssl rand -hex 32` por ejemplo). Luego:

```
npm run dev
```

Y ya deberia quedar en http://localhost:3000.

## Endpoints

Todos cuelgan de `/api/user` salvo el health, que es `/api/health`.

- `POST /register` - email + password
- `PUT /validation` - codigo de 6 digitos (se imprime por consola del server)
- `POST /login` - devuelve access + refresh token
- `PUT /register` - onboarding (nombre, apellidos, nif)
- `PATCH /company` - crear empresa o unirse a una por cif
- `PATCH /logo` - subir logo de la empresa (multipart, max 2mb)
- `GET /` - datos del usuario con la empresa populada
- `POST /refresh` - renovar tokens
- `POST /logout` - invalida el refresh token
- `DELETE /?soft=true` - baja (por defecto soft)
- `POST /invite` - solo admin, invita a alguien a la empresa
- `PATCH /password` - cambio de password (bonus)

En `requests.http` tengo ejemplos de todos, se prueban con la extension
REST Client de vscode.

## Notas

- El codigo de verificacion se imprime por consola. En un proyecto real
  iria por email pero para la practica es mas comodo asi.
- El endpoint de invite devuelve la password temporal en la respuesta
  para poder probarlo sin montar un smtp. En prod habria que quitarlo.
- Para autonomos (freelance) el cif de la company es el propio nif del
  usuario, asi no duplicamos modelo.
- `express-mongo-sanitize` no tira con express 5, asi que el saneado
  anti NoSQL lo hago con un middleware mini propio en `sanitize.middleware.js`.

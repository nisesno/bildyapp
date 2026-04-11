# bildyapp

Practica intermedia de Web II, modulo de usuarios.

## Levantarlo

```
npm install
cp .env.example .env
npm run dev
```

Necesitas rellenar el `.env` con la uri de mongo atlas y los secretos jwt.

## Endpoints

Todos bajo `/api/user`:

- POST /register
- PUT /validation
- POST /login
- PUT /register (onboarding)
- PATCH /company
- PATCH /logo
- GET /
- POST /refresh
- POST /logout
- DELETE /
- POST /invite
- PATCH /password (bonus)

Hay ejemplos en `requests.http`.

# EXAMEN — nisesno

## Reto

F12 — Tests de contrato: aislamiento multi-tenant y ciclo de vida del albaran

## Tarea tecnica

### Que problema detecte

Mirando mis tests del `tests/deliverynote.test.js` me di cuenta de que todo lo
que verifico va dentro de la misma empresa: el `beforeEach` crea un solo user
con `createCompanyUser` y de ahi tiran todos los its. Eso prueba bien el camino
feliz, pero NO prueba lo mas importante en una app multi-tenant: que la empresa
B no puede leer ni tocar los recursos de la A.

Tambien me faltaba blindar el contrato del 409 al borrar un firmado (no
verificaba el body exacto, solo el status) y la respuesta 401 cuando se
ataca el endpoint sin token.

### Como lo arregle

Cree `tests/multitenant.test.js` con 5 its en formato "dado X, cuando Y,
entonces Z". Para los tests de aislamiento, extendi `createCompanyUser` en
`tests/helpers.js:5` con un parametro `cif` opcional asi puedo levantar
dos empresas distintas en el mismo test (cada una con su CIF unico, que
si no peta el unique global de Company).

Ademas añadi un helper nuevo `joinCompanyUser` para el caso del guest:
es un usuario que se registra y luego hace `PATCH /api/user/company` con
el cif de una empresa que ya existe -> el controller se da cuenta y le
mete en la company existente como guest (eso ya estaba implementado en
`user.controller.js`, yo solo lo expongo desde el helper).

Los 5 tests cubren:

1. Aislamiento en `GET /api/deliverynote`: empresa B no ve los albaranes
   de A (totalItems=0, data=[]).
2. `GET /api/deliverynote/pdf/:id` con id de otra empresa -> 404
   (porque el `findOne` del controller filtra siempre por `company`).
3. `PATCH /:id/sign` por un user distinto pero del mismo company -> 200
   (las acciones son por compañia, no por usuario).
4. `DELETE` de un firmado -> 409 con el body exacto
   `{error:true, message:"No se puede borrar un albaran firmado"}`.
5. `GET /api/deliverynote` sin Authorization -> 401.

### Por que mi solucion es correcta

Los tests pasan (`npm test` -> 33/33, antes 28). Y mas importante: los
escenarios que cubren son los que de verdad pueden romper la seguridad
del sistema. El 1 y el 2 son lo que un profesor le pediria a la api en
una auditoria de SaaS, el 4 fija el contrato exacto del cuerpo de la
respuesta (no solo el codigo), y el 5 es la barrera basica de auth.

Tambien me he dado cuenta de un par de cosas mientras escribia los tests
que reconozco abiertamente:

- En `downloadPdf` (`deliverynote.controller.js:91`) solo filtro por
  `company`, no compruebo que el `req.user._id` sea el creador del
  albaran. La rubrica decia "del propio usuario o de un guest de su
  compañia". Ahora mismo cualquier usuario de la empresa puede descargar
  cualquier pdf de la empresa, lo cual es mas permisivo que lo pedido.
  No lo he tocado porque la tarea pedia tests, no fixes — pero lo
  reconozco en la pregunta 2.
- En el test 4 el body lo verifico con `toEqual` exacto. Si en el
  futuro alguien añade un campo `details` al middleware de errores el
  test peta, pero esa rigidez es deliberada: estoy fijando un contrato.

## Respuestas socraticas

1. El test de `tests/client.test.js:36-43` solo demuestra que el indice
   compuesto `{company:1, cif:1}` (`client.model.js:60`) bloquea
   duplicados dentro de UNA empresa. No prueba el aislamiento entre
   empresas: si una empresa B intentase crear un cliente con el mismo
   CIF que A, el indice lo permitiria (porque su `company` es distinto)
   y el `findOne` previo del `client.controller.js:17` tampoco lo
   bloquearia (filtra por company tambien). Son dos contratos
   distintos: uno es "no duplicar dentro de la empresa", el otro es
   "una empresa no ve a otra". El segundo es mas critico porque si
   falla, hay leak de datos entre clientes; si falla el primero solo
   sale un 409 cuando no debia.

2. La consecuencia es que cualquier user de la empresa A puede
   descargar pdfs de albaranes que NO son suyos siempre que sigan
   siendo de A — es mas permisivo que lo que decia la rubrica
   ("propio usuario o guest de su compañia"). Si alguien de fuera
   adivina o filtra el `_id` de un albaran de B, el `findOne` con
   `{company: companyId, ...}` devuelve null y se queda en 404, asi
   que el aislamiento entre empresas SI esta cubierto. Para añadir la
   restriccion intra-empresa cambiaria la query a algo como
   `{ _id: req.params.id, deleted: false, $or: [{ user: req.user._id },
   { company: companyId, user: { $exists: true } }] }` o mas claro,
   sacaria una segunda comprobacion despues del `findOne` con un if
   por rol/owner. Lo segundo es mas legible y mas facil de defender.

3. Cada worker de Jest arranca su propio proceso, ejecuta `startDb()`
   por separado y cada uno levanta su `MongoMemoryServer` propio con
   una URI diferente. Por eso el email fijo `'owner@bildy.test'` no
   choca aunque dos suites lo usen en paralelo: viven en BDs distintas.
   El `clearDb()` del `beforeEach` solo limpia las collections de tu
   propia conexion. Si en vez de procesos usase `workerThreads` de
   Jest 30, todos los workers compartirian el mismo modulo
   `mongoose` (singleton) y por tanto la misma conexion — ahi si
   habria carrera y pisotones, porque el `clearDb` de un worker
   borraria los datos del otro entre sus its.

4. Lo dejaria con el `findOne` actual que devuelve null y por tanto
   404. Cambiar a 403 implica hacer un `findById` sin filtro de
   company, y eso filtra informacion: el atacante sabe que el `_id`
   existe pero pertenece a otro tenant — eso es un canal de
   enumeracion. El 404 indistinguible (no existe / no es tuyo) es
   security-through-obscurity util. Sacrificas un poco de claridad
   semantica de la api a cambio de no soltar pistas. Si el cliente
   necesita distinguir, lo correcto es un 401/403 generico ("no
   autorizado") sin hacer la query extra, no un 403 que confirme
   existencia.

5. Las uso porque cubren cosas distintas y juntas dan mejor UX +
   seguridad. El `findOne` previo (`client.controller.js:17-22`) me
   permite devolver un 409 con un mensaje claro ("Ya existe un
   cliente con ese CIF") antes incluso de tocar la BD para escribir.
   El indice unique (`client.model.js:60`) es la red de seguridad
   real contra carreras: dos requests llegan a la vez, los dos hacen
   `findOne` y los dos ven null, los dos llaman a `Client.create()`
   — uno gana y el otro recibe el error 11000 que el
   `error.middleware.js:26-32` traduce a 409 generico. Sin el
   indice habria duplicados; sin el `findOne` solo habria un mensaje
   menos amigable. La race condition concreta es: `findOne` -> ok ->
   `findOne` -> ok -> `create` -> ok -> `create` -> 11000.

## Proceso

Tiempo total invertido: ~55 min.

Herramientas usadas:
- VS Code con la extension de Jest.
- `npm test` en bucle.
- Claude Code para acelerar la redaccion de los tests y para
  contrastar las respuestas socraticas.

Prompts a IA (literales, los mas relevantes):
- "explicame en una frase la diferencia entre el indice unique
  compuesto {company,cif} y el findOne previo en mi controller, en
  cual de los dos ataques fallaria cada uno"
- "si jest usa workerThreads en vez de procesos hijos, mongoose es
  singleton y comparte conexion?"
- "como verifico el body exacto de la respuesta en supertest sin que
  rompa si añado campos nuevos opcionales en el futuro"

# Prueba Técnica — Analista de Aplicaciones y Desarrollo
### Cruz Roja Colombiana, Seccional Cundinamarca y Bogotá

Aplicación web para publicar jornadas de la Cruz Roja, administrar el cupo disponible y registrar inscripciones de manera confiable, con control estricto de concurrencia.

**Backend en producción:** https://cruz-roja-backend.onrender.com

**Frontend en producción:** https://cruz-roja-frontend-a6oj.onrender.com

**Diseño (Figma):** https://www.figma.com/proto/SjQU1UgBXNuAfo6Ve6rlOh/Prueba-t%C3%A9cnica-cruz-roja?node-id=0-1&t=9QUjezK3E71tGvGP-1


> Los servicios de Render están en el plan free: si el backend lleva más de 15 minutos sin tráfico, se duerme y la primera petición tarda 30-60 segundos en responder. No es un bug, es la limitación del hosting gratuito.

---
---

## 1. Descripción del proyecto y experiencia de aprendizaje

El backend expone una API REST en Express para administrar `jornadas` (eventos) e `inscripciones`. El frontend en Next.js consume esa API mediante Server Components y Route Handlers.

El requisito principal es controlar el cupo bajo concurrencia: si 10 personas intentan inscribirse al tiempo en una jornada con 3 cupos, exactamente 3 se confirman y 7 se rechazan. Esto se resuelve con una transacción SQL usando `SELECT ... FOR UPDATE` sobre la fila de la jornada.

### Prototipo UI/UX (Figma)
Planifiqué el diseño en Figma antes de escribir CSS, y fui adaptando el backend a medida que el frontend me exigía datos que no había previsto al principio — por ejemplo, el endpoint de métricas lo diseñé después de tener el listado funcionando, cuando entendí exactamente qué necesitaba mostrar el dashboard.

![Diseño UI/UX en Figma](./docs/img/figma.png)
*Figura 1: Vistas principales diseñadas en Figma (Jornadas, Inscripciones y Error 404).*

### Arquitectura general del sistema
![Esquema de Arquitectura](./docs/img/esquema.png)
*Figura 2: Diagrama de arquitectura del sistema, comunicación entre Next.js, Express y PostgreSQL.*

### Experiencia de aprendizaje
No había trabajado antes con Next.js, App Router ni con la separación Server Components / Client Components.
El mayor reto fue salir de la zona de confort al aprenderlo e integrar la arquitectura modular del backend Express con Server Components, los Route Handlers, el enternder cuándo un componente necesita `'use client'`, y el por qué un Client Component no puede llamar directo a mi API de Express sin exponer la URL del backend al navegador, de ahí salió la decisión de usar Route Handlers de Next.js como proxy hacia Express.. Adapté el backend a medida que la interfaz requería nuevos datos, como el endpoint de métricas.

### Bug conocido: tildes en la base de datos
Los datos iniciales del archivo `DatosParaDB.sql` se guardaron sin tildes. Durante las pruebas se detectó una falla con el encoding UTF-8 en PowerShell / `psql` bajo Windows que corrompía los caracteres especiales (`Ã³` en vez de `ó`). Como solución temporal se omitieron las tildes en los datos de prueba.

---

### Árbol de carpetas

```
Prueba_Tech_Cruz_Roja/
├── .github/workflows/ci.yml          # Pipeline de GitHub Actions
├── backend/
│   ├── scripts/concurrency-test.js   # Prueba de 10 inscripciones en paralelo
│   ├── src/
│   │   ├── config/                   # Pool de PostgreSQL y variables de entorno
│   │   ├── db/                       # Migraciones, seed, queries.sql manuales
│   │   ├── errors/                   # Clases de error tipadas (AppError y subclases)
│   │   ├── middlewares/              # Validación (Zod) y manejo de errores centralizado
│   │   ├── modules/
│   │   │   ├── jornadas/             # repository, service, controller, rutas, tests
│   │   │   ├── inscripciones/        # incluye la transacción de control de cupo
│   │   │   └── metricas/             # endpoint agregado de métricas
│   │   ├── app.js / server.js
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/                  # Route Handlers: proxy hacia Express
│   │   │   ├── jornadas/             # listado, detalle, formularios
│   │   │   ├── not-found.js          # 404 institucional
│   │   │   └── layout.js
│   │   ├── components/               # LogoCruz, IlustracionEquipo, ConfirmModal, EstadoVacio, Footer
│   │   └── lib/api.js                # funciones que llaman al backend (solo desde el servidor)
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── .gitignore
```

---

### Componentes clave del frontend

| Componente | Qué hace |
|---|---|
| `LogoCruz.js` | Ícono institucional propio (cruz blanca sobre fondo rojo redondeado), no el emblema oficial de la Cruz Roja — ese está protegido por los Convenios de Ginebra y no se puede reproducir libremente. |
| `IlustracionEquipo.js` | Ilustración SVG del equipo médico usada en la página 404, con uniformes en azul/rojo institucional. |
| `ConfirmModal.js` | Modal de confirmación genérico, reutilizado para cancelar inscripción y desactivar jornada. |
| `EstadoVacio.js` | Estado vacío con ícono para listados sin resultados (jornadas filtradas, inscritos). |
| `jornadas/page.js` | Server Component: listado con filtros, trae datos directo del backend. |
| `jornadas/[id]/page.js` | Server Component: detalle de jornada, inscripción, listado de inscritos, editar/desactivar. |

---

## 2. Tecnologías y versiones

| Categoría | Tecnología | Versión |
|---|---|---|
| Runtime | Node.js | 20 LTS |
| Backend | Express | 5.2.1 |
| Backend | pg (driver PostgreSQL) | 8.23.0 |
| Backend | Zod (validación) | 4.5.4 |
| Backend | dotenv | 17.4.2 |
| Testing | Jest | 30.5.1 |
| Base de datos | PostgreSQL | 16 |
| Frontend | Next.js (App Router) | 16.3.4 |
| Frontend | React | 19 (la que trae Next 16) |
| Contenedores | Docker / Docker Compose | — |
| CI | GitHub Actions | — |
| Fuente | Public Sans (next/font/google) | — |

No se usó TypeScript ni Tailwind: JavaScript plano y CSS Modules por decisión explícita.

---
---

## 3. Instalación y ejecución

### Opción A — Docker (recomendada, un solo comando)

Requiere [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo.

```bash
git clone https://github.com/Andrenickolands/prueba-tecnica-cruz-roja.git
cd prueba-tecnica-cruz-roja
docker compose up --build
```

Esto levanta 3 contenedores: PostgreSQL, backend (corre migraciones y carga datos de prueba automáticamente al arrancar) y frontend. Cuando termine:

- Frontend: http://localhost:3000/jornadas
- Backend: http://localhost:4000/api/jornadas

Para una prueba completamente limpia (borra también los datos):
```bash
docker compose down -v
docker compose up --build
```
---

### Opción B — Local, sin Docker

Requiere Node.js 20 y PostgreSQL 16 instalados.

**1. Base de datos**
```sql
CREATE DATABASE cruz_roja_jornadas;
```

**2. Backend**
```bash
cd backend
npm install
cp .env.example .env
# edita .env con tu contraseña real de PostgreSQL
npm run migrate
npm run seed
npm run dev
```
Queda escuchando en `http://localhost:4000`.

**3. Frontend** (en otra terminal)
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```
Queda escuchando en `http://localhost:3000`.

---
---

## 4. Variables de entorno

### `backend/.env`

```env
PORT=4000
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/cruz_roja_jornadas
```

| Variable | Propósito |
|---|---|
| `PORT` | Puerto donde escucha Express. |
| `DATABASE_URL` | Cadena de conexión completa a PostgreSQL (usuario, contraseña, host, puerto, nombre de base de datos). |

---

### `frontend/.env.local`

```env
BACKEND_URL=http://localhost:4000
```

| Variable | Propósito |
|---|---|
| `BACKEND_URL` | URL del backend Express. **No lleva prefijo `NEXT_PUBLIC_`** a propósito: esa variable solo la leen Server Components y Route Handlers (código que corre en el servidor de Next.js), nunca el navegador. Si llevara `NEXT_PUBLIC_`, Next.js la incluiría en el bundle de JavaScript del cliente, exponiendo la URL del backend. |

En producción (Render), estas mismas variables se configuran como Environment Variables del servicio, apuntando a la URL interna/pública correspondiente en vez de `localhost`.

---
---

## 5. Migraciones, seed y prueba de concurrencia

### Migraciones

Scripts SQL numerados en `backend/src/db/migrations/`, aplicados en orden por un runner en Node (no un ORM):

```bash
cd backend
npm run migrate
```
Equivale a `node src/db/runMigrations.js`. Todos los `CREATE TABLE IF NOT EXISTS` se puede correr varias veces sin romper nada.

---

### Datos de prueba

```bash
npm run seed
```
Sirve para insertar datos de prueba en la base de datos. Equivale a `node src/db/runSeed.js`, que ejecuta `DatosParaDB.sql`. Cada `INSERT` usa `WHERE NOT EXISTS`, así que también se puede correr varias veces sin romper nada.

---
---
---

### Script de prueba de concurrencia 

Primero crea una jornada con cupo reducido para poder verificar el resultado fácilmente (por ejemplo, Asigna solo 3 cupos a la jornada), copia su `id`, y ejecuta:

```bash
npm run test:concurrency -- <id-de-la-jornada> 10
```

Lanza 10 solicitudes de inscripción en paralelo (`Promise.all`) contra esa jornada e imprime cuántas se confirmaron, cuántas se rechazaron, y en qué quedó el cupo ocupado en la base de datos. Con cupo 3, el resultado esperado y verificado es:

```
Confirmadas (201):      3
Rechazadas (409/otro):  7
Cupo ocupado en BD:     3
```
![demostración del control de concurrencia](./docs/img/concurrencia.png)
Resultado del script simulando 10 peticiones en paralelo sobre 3 cupos disponibles.

---

### Pruebas unitarias

```bash
npm test
```
Corre Jest sobre `jornadas.service.js` (7 casos: reglas de negocio de modificación, eliminación y búsqueda de jornadas, con el repository mockeado).

![Test unitario](./docs/img/testUnitario.png)
Ejecución de pruebas unitarias sobre las reglas de negocio.

---

### Prueba de métricas con Thunder Client
![Pruebas de los servicios](./docs/img/thunder.png)
Verificación del endpoint de métricas mediante cliente HTTP.

---
---
---

## 6. Decisiones técnicas, supuestos y limitaciones

### Decisiones técnicas y qué descarté

**Arquitectura modular por dominio (`modules/jornadas`, `modules/inscripciones`, `modules/metricas`) en vez de MVC tradicional.** Cada módulo tiene su propio `repository` (SQL), `service` (reglas de negocio), `controller` (Express) y `schema` (Zod). Descarté un MVC clásico con carpetas `controllers/`, `models/`, `routes/` a nivel raíz porque con solo 3 entidades ya hay lógica de negocio cruzada entre jornadas e inscripciones; separar por capa técnica en vez de por dominio hubiera dispersado esa lógica en archivos sin relación aparente entre sí.

**Control de concurrencia con `SELECT ... FOR UPDATE` dentro de una transacción, en vez de un `UPDATE` atómico con `WHERE cupo_ocupado < cupo_total`.** Ambos enfoques garantizan el resultado correcto ya que PostgreSQL bloquea la fila en cualquiera de los dos casos, pero elegí `FOR UPDATE` porque se necesita leer y validar varias reglas de negocio dentro del mismo bloqueo (jornada activa, fecha no vencida, cupo disponible, persona no duplicada) antes de decidir si se confirma la inscripción — un solo `UPDATE` condicional no permite combinar esas 4 validaciones de forma tan explícita.

**SQL nativo con migraciones manuales numeradas, en vez de un ORM.** Se descartaron ORMs complejos (como Prisma) y se usó SQL nativo con consultas preparadas para garantizar control total sobre el locking de concurrencia.

**JavaScript plano en vez de TypeScript.** TypeScript añade configuración (tsconfig, tipos, build step) que resta tiempo. Con buena documentación en las funciones del repository fue suficiente para mantener claridad sobre qué recibe y devuelve cada función.

**CSS Modules en vez de Tailwind.** Con una paleta institucional pequeña y bien definida (rojo, azul, grises), variables CSS nativas en `:root` me dieron el mismo resultado de consistencia sin agregar una dependencia de compilación extra.

**Route Handlers específicos por acción, en vez de un proxy genérico catch-all.** Podría tener un solo `app/api/[...path]/route.js` que reenvíe cualquier cosa a Express. Elegí Route Handlers explícitos (`/api/jornadas`, `/api/jornadas/[id]/inscripciones`, etc.) porque cada uno documenta exactamente qué operación expone el frontend.

### Supuestos que asumí

- **Reducir el cupo total por debajo del ocupado se rechaza con 409**, no se trunca automáticamente. El enunciado dice "no se debe permitir.
- **Cancelar una inscripción no depende del estado de la jornada.** El enunciado solo prohíbe *inscribirse* en una jornada inactiva o vencida; no encontré ninguna razón de negocio para bloquear la cancelación de una inscripción ya existente si la jornada después se desactiva.
- **"Eliminar jornada**, No borra la jornada con Delete, sino solo lo desactiva para no perder el historial de inscripciones asociadas.
- **El filtro de listado por "con cupo" / "sin cupo" es una regla de presentación**, no un parámetro que el backend necesite soportar como query param — se calcula en el propio Server Component después de traer los datos, adicional a eso separe las activas de las inactivas y un filtro con todas.
- **Los datos de un formulario de inscripción no requieren autenticación de la persona que se inscribe** El enunciado no menciona login de usuarios finales, solo personal administrativo usando la herramienta.

### Qué dejé fuera y cómo lo resolvería

- **Autenticación/autorización (JWT u OAuth) para el personal que administra jornadas.** Hoy cualquiera con la URL puede crear, editar o desactivar jornadas. En un sprint siguiente agregaría un login simple con JWT y un middleware de Express que valide el token antes de las rutas de escritura (`POST`, `PUT`, `DELETE`).
- **Reintentos automáticos en el frontend ante fallos de red** (por ejemplo, si el backend está "dormido" en Render). Ahora mismo un fallo de red simplemente muestra un mensaje de error; agregaría un reintento con backoff exponencial en `lib/api.js`.
- **Soporte completo UTF-8 para el bug de tildes descrito en la sección 1.** Confirmé que el server_encoding de PostgreSQL es correcto y descarté que fuera un problema de datos ya guardados, pero no alcancé a aislar si la causa está en una versión específica de `pg`, en cómo Node maneja el stream de la conexión en Windows, o en algo del propio driver nativo de libpq vs. el driver JS. Necesitaría reproducirlo en un entorno Linux limpio (fuera de Windows) para descartar que sea un problema específico del sistema operativo de desarrollo.
- **Paginación en el listado de jornadas.** Con pocas jornadas de prueba no hacía falta, pero en producción real con cientos de jornadas el listado necesitaría paginar tanto en el backend (`LIMIT`/`OFFSET`) como en el frontend.
- **Registro de Auditoría.** Actualmente no se sabe quién o qué se esta creando, desactivando o actualizando, más adelante agregaría un patron de diseño Audit Log para recibir los datos del usuario, la fecha y el cambio, y asi tener control.

### La parte más frágil de mi solución

El control de cupo bajo concurrencia (`FOR UPDATE`) es sólido para el volumen de esta prueba, pero bajo carga muy alta (miles de solicitudes simultáneas sobre la misma jornada) el bloqueo de fila serializa todo el tráfico de esa jornada específica — es correcto, pero no es lo más performante posible; una cola de mensajes (por ejemplo, con Redis) desacoplaría mejor la validación del cupo de la respuesta HTTP inmediata.

---
---
---

## 7. Despliegue en servidor Ubuntu desde cero

Esta guía asume un servidor Ubuntu 22.04+ limpio, acceso por SSH con un usuario con permisos `sudo`, y que ya tienes el dominio o la IP pública del servidor.

### 1. Actualizar el sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Docker y Docker Compose

```bash
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker $USER
newgrp docker
```

Verifica:
```bash
docker --version
docker compose version
```

### 3. Clonar el repositorio

```bash
git clone https://github.com/Andrenickolands/prueba-tecnica-cruz-roja.git
cd prueba-tecnica-cruz-roja
```

### 4. Configurar variables de entorno de producción

Como `docker-compose.yml` ya define `DATABASE_URL` y `BACKEND_URL` apuntando a los nombres de servicio internos (`db`, `backend`), no hace falta editar nada si vas a exponer el proyecto solo detrás de un reverse proxy en el mismo servidor. Si quieres cambiar contraseñas de la base de datos por defecto, edita el bloque `environment` del servicio `db` en `docker-compose.yml`.

### 5. Levantar los contenedores

```bash
docker compose up --build -d
```
El flag `-d` lo deja corriendo en segundo plano.

### 6. Instalar y configurar Nginx como reverse proxy

```bash
sudo apt install -y nginx
```

Crea `/etc/nginx/sites-available/cruz-roja`:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

Actívalo:
```bash
sudo ln -s /etc/nginx/sites-available/cruz-roja /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. HTTPS con Certbot (opcional pero recomendado)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

### 8. Verificar

```bash
curl http://localhost:4000/api/jornadas
curl http://localhost:3000
```

Y desde el navegador, `http://tu-dominio.com/jornadas` (o `https://` si configuraste Certbot).

---
---
---
---

## Nota final

Este README y el código completo están pensados para que cualquier persona levante el proyecto sin tener que preguntarme nada. Trate de redactarlo de la forma más sencilla posible. Si algo no funciona siguiendo estos pasos exactos, es un bug real que vale la pena reportar, no un paso que falta documentar.

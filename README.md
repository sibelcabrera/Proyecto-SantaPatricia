# Santa Patricia — Sistema de Inventario (Sprint 1)

Sistema web para el control de inventario de la **Panadería, Pastelería y Minimarket Santa Patricia**.
Cumple el Sprint 1 de Jira:

- **HU01 (SISPS-2):** inicio de sesión con los 4 roles: Administrador, Encargado de Producción, Cajero y Almacenero.
- **HU02 (SISPS-3):** registro del catálogo de productos. El código se genera solo y hay buscador y filtros por área.

## Arquitectura (según el esquema del proyecto)

```
FRONTEND  React + TypeScript + Tailwind        (carpeta frontend/, se abre en http://localhost:8087/santapatricia/)
    │  peticiones HTTP con JSON  (GET, POST, PUT, DELETE)
    ▼
BACKEND   Java + Servlets en GlassFish 8        (carpeta backend/,   http://localhost:8087/santapatricia)
          Servlet → Service/ServiceImpl → DAO/DAOImpl → JDBC
    ▼
MySQL     base santapatricia_db                 (carpeta database/)
```

**Flujo:** React envía una petición → el **Servlet** la recibe → el **Service** aplica las reglas del negocio →
el **DAO** consulta MySQL con SQL → el backend responde con JSON → React lo muestra.

```
SantaPatricia/
├── frontend/                 React (lo abren en VS Code)
│   └── src/  components/  pages/  services/ (llamadas a la API)  types/
├── backend/                  Proyecto Maven (lo abren en NetBeans)
│   └── src/main/java/pe/edu/isil/santapatricia/
│       ├── model/            clases que representan las tablas (Usuario, Producto, Categoria)
│       ├── dto/              JSON que entra y sale de la API
│       ├── servlet/          reciben las peticiones (AuthServlet, ProductoServlet...)
│       ├── service/ + impl/  reglas del negocio (login, validaciones, código automático)
│       ├── dao/ + impl/      SQL con JDBC
│       └── config/           conexión MySQL, JSON, token JWT, filtros de seguridad y CORS
├── database/
│   ├── esquema.sql           crea la base y las tablas
│   └── datos_prueba.sql      usuarios y 51 productos de ejemplo
└── README.md
```

---

## Qué necesitas instalado

| Programa | Para qué |
|---|---|
| **MySQL 8** y **MySQL Workbench** | Base de datos |
| **Apache NetBeans** con **GlassFish 8** registrado | Backend |
| **JDK 21** | Java |
| **Node.js** (versión 20 o más nueva) | Frontend |
| **Visual Studio Code** | Editar y ejecutar el frontend |

**Extensiones de VS Code: ninguna es obligatoria.** Recomendadas: *ESLint*, *Tailwind CSS IntelliSense* y *ES7+ React/Redux/React-Native snippets*.

---

## Cómo levantar el sistema

### 1. Base de datos (solo la primera vez)
En **MySQL Workbench**:
1. *File → Open SQL Script →* `database/esquema.sql` → botón del **rayo ⚡**.
2. *File → Open SQL Script →* `database/datos_prueba.sql` → **rayo ⚡**.

Al final se ven los 6 usuarios y los productos por área.

> `esquema.sql` **borra y vuelve a crear** `santapatricia_db`. Ejecútenlo de nuevo cuando quieran volver a los datos iniciales.

### 2. Backend (NetBeans)
1. En `backend/src/main/resources/` copia `config.example.properties` y renombra la copia a
   **`config.properties`**. Ahí pon tu contraseña de MySQL (`db.password=`) y una clave propia en `jwt.clave=`
   (32 caracteres o más). Este archivo **no se sube a GitHub** porque guarda contraseñas.
2. NetBeans → *File → Open Project →* carpeta **`backend`** (ícono de mundo 🌐).
3. Botón **Run ▶**. NetBeans compila, arranca GlassFish y abre el navegador **directo en el login**:
   **http://localhost:8087/santapatricia/** → **¡listo, no hace falta nada más!**

El frontend React **ya viene compilado dentro del backend** (carpeta `backend/src/main/webapp/app`),
por eso con solo Run funciona todo. Estado del backend y lista de la API: http://localhost:8087/santapatricia/estado.html

### 3. Solo para quien modifique el diseño del frontend (VS Code)
1. VS Code → *File → Open Folder →* carpeta **`frontend`** → *Terminal → New Terminal*.
2. Para ver los cambios en vivo mientras diseñas: `npm run dev` (abre http://localhost:5173).
3. **Cuando termines**, para que los cambios lleguen al sistema que abre NetBeans:
   ```
   npm run build
   ```
   Esto copia la versión final dentro del backend. Luego pulsa **Run** otra vez en NetBeans.

> La primera vez en otra PC, si falta la carpeta `node_modules`, ejecuten antes `npm install`.

---

## Usuarios de prueba

| Correo | Contraseña | Rol | Qué puede hacer |
|---|---|---|---|
| admin@santapatricia.pe | Admin123 | Administrador | Todo: ver, registrar y eliminar productos |
| produccion@santapatricia.pe | Prod123 | Encargado de Producción | Ver el inventario |
| caja@santapatricia.pe | Caja123 | Cajero | Ver el inventario |
| almacen@santapatricia.pe | Alma123 | Almacenero | Ver el inventario |
| rosa.huaman@santapatricia.pe | Rosa123 | Cajero | Ver el inventario |
| pedro.salas@santapatricia.pe | Pedro123 | Almacenero | **Dado de baja**: no puede entrar (para probar) |

**Sobre las contraseñas:** por decisión del equipo se guardan **visibles** en la tabla `usuarios`, para que sean fáciles
de entender y probar. En un sistema real se guarda un *hash* (por ejemplo BCrypt): un texto irreversible, para que,
si alguien roba la base de datos, no pueda leer las contraseñas.

---

## Qué hace el sistema (Sprint 1)

**HU01, inicio de sesión**
- Correo y contraseña. Si son incorrectos: *"Correo o contraseña incorrectos"* (el mismo mensaje si el correo no existe, para no dar pistas).
- **5 contraseñas incorrectas seguidas bloquean la cuenta 15 minutos.**
- Al entrar, el backend entrega un **token (JWT)** que React envía en cada petición. Sin token, la API responde 401.
- **Solo el Administrador** ve el botón *Nuevo producto* y el de eliminar. Los demás roles ven un aviso de que solo pueden consultar.

**HU02, registrar productos**
- Botón **Nuevo producto** → nombre, área, unidad (KG, G, L, ML, UND, PAQ), stock, stock mínimo, precio y vencimiento.
- **El código se genera solo** con las 3 primeras letras del nombre: *Azúcar rubia* → `AZU-001`; el siguiente azúcar → `AZU-002`.
- **"¿Cómo llega?":** escribes *10 sacos de 10 KG* y el stock que entra se llena solo con **100 KG**.
- Valida campos vacíos y nombres repetidos, y muestra el mensaje debajo de cada casilla.
- El producto nuevo aparece **resaltado en verde** en la lista.
- **Buscador** (arriba) por nombre o código, también sin tildes, y **filtros por área**.
- **Estado del stock** que calcula el backend: *Crítico* (≤ la mitad del mínimo), *Bajo* (≤ mínimo) u *Óptimo*.

---

## Direcciones de la API

Base: `http://localhost:8087/santapatricia/api`

| Método | Dirección | Quién | Respuesta |
|---|---|---|---|
| POST | `/auth/login` | Libre | 200 `{token, usuario}` · 400 · 401 |
| GET | `/auth/me` | Con sesión | 200 usuario · 401 |
| GET | `/inventario/productos` | Con sesión | 200 lista |
| GET | `/inventario/productos/{id}` | Con sesión | 200 · 404 |
| POST | `/inventario/productos` | Administrador | 201 · 400 · 403 · 409 |
| PUT | `/inventario/productos/{id}` | Administrador | 200 · 400 · 403 · 404 · 409 |
| DELETE | `/inventario/productos/{id}` | Administrador | 204 · 403 · 404 |
| GET | `/inventario/categorias` | Con sesión | 200 áreas |
| GET | `/inventario/unidades` | Con sesión | 200 unidades |
| GET | `/salud` | Libre | Estado del backend y la base |

Errores: `{"message": "...", "errores": {"campo": "mensaje"}}`

---

## Pruebas automáticas

En NetBeans: clic derecho al proyecto `backend` → **Test**. Son **18 pruebas** (login, bloqueo, roles, código automático
y validaciones). Usan datos en memoria, **no necesitan MySQL**.

---

## Si algo falla

| Síntoma | Solución |
|---|---|
| La página del backend dice *"base de datos SIN CONEXIÓN"* | MySQL apagado, falta ejecutar los scripts o la contraseña de `config.properties` no es la tuya |
| El login dice *"No se pudo conectar con el servidor"* | El backend no está corriendo: pulsa Run en NetBeans |
| `localhost:5173` dice *"rechazó la conexión"* | Ese es el modo diseño (`npm run dev`). Para usar el sistema entra a http://localhost:8087/santapatricia/ |
| En NetBeans: `PKIX path building failed` | Antivirus que revisa HTTPS (Norton). *Tools → Options → Java → Maven → Global Execution Options:* `-Djavax.net.ssl.trustStoreType=Windows-ROOT` |
| `npm run dev` dice *"no se reconoce npm"* | Falta instalar Node.js |
| El front muestra datos inventados | En `frontend/.env` debe decir `VITE_USE_MOCKS=false` |
| GlassFish usa otro puerto en tu PC | Cambia el puerto en `frontend/.env` (`VITE_API_URL`) |

---

## Cambios hechos al frontend del equipo

Para conectarlo con el backend se modificó la **copia** que está en esta carpeta (el original no se tocó):

| Archivo | Cambio |
|---|---|
| `src/types/auth.ts` | Los 4 roles de Jira |
| `src/components/layout/Header.tsx` | Nombres de los 4 roles. El buscador ahora filtra la tabla |
| `src/types/inventario.ts` | 5 áreas, 6 unidades; el `sku` es opcional (lo genera el backend) |
| `src/types/api.ts`, `src/api/axios.ts` | Errores por campo (`errores`) |
| `src/api/config.ts`, `src/services/inventarioService.ts`, `src/services/mocks/inventarioMock.ts` | Direcciones de áreas y unidades |
| `src/constants/etiquetas.ts` (nuevo) | Nombres de las áreas |
| `src/components/dashboard/NuevoProductoModal.tsx` (nuevo) | Formulario *Nuevo producto* (estaba pendiente) |
| `src/components/dashboard/InventarioTable.tsx` | Áreas, precio, fila nueva resaltada, eliminar solo para el administrador |
| `src/pages/Dashboard.tsx` | Filtros por área, buscador, botón y aviso según el rol |
| `src/hooks/useInventario.ts` | La lista se mantiene ordenada al registrar |
| `.env` / `.env.example` | URL del backend (puerto 8087) y `VITE_USE_MOCKS=false` |
| `package.json` | `npm run dev` abre el navegador solo |

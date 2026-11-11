# Contratos y convenciones — logitrack-frontend

Las convenciones existen para que el código de los cuatro parezca escrito por una sola persona, y para
que las sesiones de Claude de cada integrante generen lo mismo. Cada uno le pasa este documento a
Claude al empezar su issue.

1. [Convenciones de nombres](#1-convenciones-de-nombres)
2. [Firmas públicas del núcleo](#2-firmas-públicas-del-núcleo-agus)
3. [Props de los componentes compartidos](#3-props-de-los-componentes-compartidos-dani)
4. [Tipos de los DTO](#4-tipos-de-los-dto)
5. [Reglas](#5-reglas)

---

## 1. Convenciones de nombres

| Tema                  | Regla                                                                                                                                                    | Ejemplo y porqué                                                                                                                                                                                                                                               |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Idioma                | Dominio en español (igual que el backend), infraestructura en inglés.                                                                                    | `Envio`, `Repartidor`, `enviosApi.cancelar()` / `httpClient`, `useAuth`, `RequireAuth`. Mezclar `Shipment` en el front con `Envio` en el back obliga a traducir mentalmente todo el tiempo.                                                                    |
| Tipos de los DTO      | Mismos nombres de campo que el JSON del backend, letra por letra.                                                                                        | `estadoEnvio`, no `estado`. Si no coinciden, habría que escribir conversores.                                                                                                                                                                                  |
| Archivos              | Componentes y páginas en `PascalCase.tsx`; hooks `useXxx.ts`; servicios `xxxApi.ts`; estilos `Xxx.module.css`; tests `Xxx.test.tsx` al lado del archivo. | `EnvioListPage.tsx`, `EnvioListPage.module.css`, `EnvioListPage.test.tsx`.                                                                                                                                                                                     |
| Nombres de páginas    | `<Entidad><Acción>Page`                                                                                                                                  | `EnvioListPage`, `EnvioDetailPage`, `EnvioCreatePage`, `RepartidorEditPage`.                                                                                                                                                                                   |
| Tipos TS              | `interface` para objetos; uniones de texto para enumeraciones. No usar `enum` ni `any`.                                                                  | La plantilla de Vite activa una opción (`erasableSyntaxOnly`) que no admite `enum`. `any` desactiva TypeScript y anula su beneficio.                                                                                                                           |
| Nombres de tipos      | `XxxRequest` para lo que se envía, `XxxResponse` para lo que se recibe.                                                                                  | `EnvioRequest`, `EnvioResponse`, `RepartidorResponse`.                                                                                                                                                                                                         |
| Variables y funciones | `camelCase`; constantes `UPPER_SNAKE_CASE`; manejadores `handleXxx`; booleanos `isXxx` o `puedeXxx`.                                                     | `handleSubmit`, `isLoading`, `MAX_PESO`.                                                                                                                                                                                                                       |
| Funciones de API      | Un objeto por recurso, un método por endpoint, verbos en español iguales a los del backend.                                                              | `enviosApi.listar(estado?)`, `.obtener(id)`, `.buscarPorCodigo(c)`, `.crear(dto)`, `.cancelar(id)`, `.asignarRepartidor(id, dni)`.                                                                                                                             |
| Pedidos HTTP          | Solo a través de `httpClient`. Prohibido usar `fetch` o `axios` directo en componentes.                                                                  | Si alguien usa `fetch` directo, ese pedido no lleva token ni maneja 401/403.                                                                                                                                                                                   |
| Rutas de pantallas    | En español, kebab-case, plural.                                                                                                                          | `/login`, `/registro`, `/perfil`, `/envios`, `/envios/nuevo`, `/envios/:id`, `/envios/seguimiento`, `/clientes`, `/clientes/nuevo`, `/clientes/:dni`, `/clientes/:dni/editar`, `/repartidores` (mismo patrón), `/usuarios`, `/usuarios/nuevo`, `/sin-permiso`. |
| Errores               | Las pantallas atrapan el `ApiError` y llaman a `toast.error(e.message)`; los formularios usan `fieldErrors`. Prohibido `alert()`.                        | Mismo aspecto de errores en toda la app.                                                                                                                                                                                                                       |
| Variables de entorno  | Frontend: solo `VITE_API_BASE_URL`. Compose: `CORS_ALLOWED_ORIGINS`, `FRONTEND_PORT`, `RABBITMQ_USER`, `RABBITMQ_PASSWORD`.                              | Valores reales en `.env` (fuera de git); en git, solo `.env.example` sin secretos.                                                                                                                                                                             |
| RabbitMQ              | Exchange `logitrack.<servicio>.events`; routing key `<entidad>.<hecho en participio>`; cola `<consumidor>.<origen>-events.q`; DLQ `<cola>.dlq`.          | `logitrack.courier.events`, `repartidor.desactivado`, `shipment.courier-events.q`.                                                                                                                                                                             |
| Git                   | Rama `feature/LT4-xx-descripcion`; commits Conventional Commits; PR a `develop` con 1 aprobación y CI en verde; squash merge.                            | `feat(envios): agregar filtro por estado`, `fix(auth): no redirigir en 401 del login`.                                                                                                                                                                         |

---

## 2. Firmas públicas del núcleo (Agus)

Es lo que las demás features importan.

```ts
// shared/api/httpClient.ts
export const httpClient: AxiosInstance;

// shared/api/apiError.ts
export class ApiError extends Error {
  status: number; // 0 = sin respuesta del servidor
  fieldErrors?: Record<string, string>;
  raw?: unknown;
}
export function toApiError(error: unknown): ApiError;

// shared/api/servicePaths.ts
export const SECURITY: string;
export const SHIPMENT: string;
export const COURIER: string;

// shared/auth/permissions.ts → Rol, PERMISOS, Permiso
// shared/auth/sessionStore.ts → Sesion
// shared/auth/useAuth.ts → useAuth
export type Rol = 'ADMIN' | 'CLIENTE' | 'REPARTIDOR';
export interface Sesion {
  token: string;
  userId: string;
  username: string;
  roles: Rol[];
  exp: number;
  dni?: string; // claim "dni": CLIENTE con sus datos de cliente y REPARTIDOR con su ficha (LT4-40)
}
export function useAuth(): {
  sesion: Sesion | null;
  login(u: string, p: string): Promise<void>;
  logout(): void;
  tienePermiso(p: Permiso): boolean;
};
export type Permiso = keyof typeof PERMISOS;
```

**Uso de errores en las pantallas.** `httpClient` siempre rechaza con un `ApiError`, pero en
TypeScript el `catch` recibe `unknown`. Usá `toApiError` para tiparlo:

```ts
try {
  await enviosApi.cancelar(id);
} catch (e) {
  const error = toApiError(e);
  toast.error(error.message); // formularios: error.fieldErrors
}
```

Un 401 o 403 (salvo en login y registro) ya cierra la sesión y lleva a `/login` desde `httpClient`:
las pantallas no tienen que manejarlo.

### Permisos (`shared/auth/permissions.ts`)

Cada permiso indica qué roles lo tienen. Replican las reglas de roles del api-gateway
(`config-ms/api-gateway-dev.yaml`). Sirven para mostrar u ocultar elementos de la UI; la validación
real la hace el gateway.

```ts
export const PERMISOS = {
  'envios.ver': ['ADMIN', 'CLIENTE', 'REPARTIDOR'],
  'envios.crear': ['ADMIN', 'CLIENTE'],
  'envios.cancelar': ['ADMIN'],
  'envios.asignarRepartidor': ['ADMIN'],
  'envios.cambiarEstado': ['ADMIN', 'REPARTIDOR'],
  'clientes.ver': ['ADMIN', 'CLIENTE'],
  'clientes.gestionar': ['ADMIN'],
  'repartidores.ver': ['ADMIN', 'REPARTIDOR'],
  'repartidores.gestionar': ['ADMIN'],
  'repartidores.cambiarEstado': ['ADMIN', 'REPARTIDOR'],
  'usuarios.gestionar': ['ADMIN'],
} as const satisfies Record<string, readonly Rol[]>;
```

| Permiso                      | Regla del gateway que replica                                      |
| ---------------------------- | ------------------------------------------------------------------ |
| `envios.ver`                 | `GET /envios/**` → ADMIN, CLIENTE, REPARTIDOR                      |
| `envios.crear`               | `POST /envios` → ADMIN, CLIENTE                                    |
| `envios.cancelar`            | `PATCH /envios/{id}/cancelar` (cae en `/envios/**`) → ADMIN        |
| `envios.asignarRepartidor`   | `PUT /envios/{id}/asignarRepartidor` (cae en `/envios/**`) → ADMIN |
| `envios.cambiarEstado`       | `PUT\|PATCH /envios/*/estado` → ADMIN, REPARTIDOR                  |
| `clientes.ver`               | `GET /clientes/{id}` → ADMIN, CLIENTE                              |
| `clientes.gestionar`         | `/clientes/**` (resto) → ADMIN                                     |
| `repartidores.ver`           | `GET /repartidores/**` → ADMIN, REPARTIDOR                         |
| `repartidores.gestionar`     | `/repartidores/**` (resto) → ADMIN                                 |
| `repartidores.cambiarEstado` | `PUT /repartidores/*/estado` → ADMIN, REPARTIDOR                   |
| `usuarios.gestionar`         | `GET /api/users` en security-service → ADMIN                       |

Si una feature necesita un permiso nuevo, se agrega con un PR a `permissions.ts` y a esta tabla.

**Envíos visibles para un REPARTIDOR.** Un REPARTIDOR solo ve los envíos asignados a él
(`puedeVerEnvio` en `features/envios/formato.ts`). Los pendientes de asignación tampoco los ve,
porque no puede asignárselos. Se aplica en el listado, en el detalle y en el seguimiento. Un envío
que no ve se muestra como "no encontrado". Se compara `Sesion.dni` (el DNI de su ficha, que carga el
alta unificada, LT4-40) con `repartidorAsignado` (`"DNI: <dni>"`). Un REPARTIDOR sin DNI no ve
ningún envío. shipment-service aplica la misma regla con `X-User-Dni` (404 para un envío ajeno).

```tsx
// shared/guards/RequireAuth.tsx, RequireRole.tsx, Can.tsx
<RequireAuth />                                // ruta "padre" que exige sesión
<RequireRole permiso="clientes.gestionar" />
<Can permiso="envios.cancelar">…</Can>
```

**Ejemplo en el `routes.tsx` de una feature** (las rutas ya están dentro de `RequireAuth`):

```tsx
import type { RouteObject } from 'react-router';
import { RequireRole } from '../../shared/guards/RequireRole';

export const clientesRoutes: RouteObject[] = [
  {
    element: <RequireRole permiso="clientes.gestionar" />,
    children: [{ path: '/clientes', element: <ClienteListPage /> }],
  },
];
```

Si el usuario entra a mano a una ruta sin permiso, `RequireRole` lo manda a `/sin-permiso` sin
cerrar la sesión. Si el backend responde 403, `httpClient` sí la cierra.

```ts
// convención de rutas y menú por feature
export const enviosRoutes: RouteObject[]; // rutas privadas
export const usuariosPublicRoutes: RouteObject[]; // solo auth y usuarios tienen públicas
export const enviosNav: NavItem[]; // NavItem = { label: string; to: string; permiso?: Permiso }
```

---

## 3. Props de los componentes compartidos (Dani)

<!-- Dani: completar con las props de los componentes compartidos. -->

_Pendiente: las escribe Dani._

---

## 4. Tipos de los DTO

Cada dueño escribe los tipos de su módulo, copiados del backend, y los valida contra el código Java.

### 4.1 Autenticación (Agus)

Archivo: `src/shared/auth/types.ts`. Copiados de `security-service/.../dto/LoginRequest.java` y
`JwtResponse.java`.

```ts
// POST /applications/apisecurity/api/auth/login
export interface LoginRequest {
  username: string; // obligatorio
  password: string; // obligatorio
}

// Respuesta 200 del login
export interface JwtResponse {
  token: string;
  type: 'Bearer'; // en Java es String con valor fijo "Bearer"
  userId: string; // UUID
  username: string;
  roles: Rol[]; // ordenados y sin prefijo ROLE_, ej. ['ADMIN']
}
```

### 4.2 Envíos (Luci)

<!-- Luci: completar. -->

_Pendiente._

### 4.3 Clientes y repartidores (Dani)

<!-- Dani: completar. -->

_Pendiente._

### 4.4 Usuarios (Elías)

Archivo: `src/features/usuarios/types.ts`. Copiados de `security-service/.../dto/RegistroRequest.java`
y `UserResponse.java`.

```ts
// POST /applications/apisecurity/api/auth/register
// Sin token solo crea CLIENTE (no mandar roles). Con token de ADMIN acepta cualquier rol.
export interface RegistroRequest {
  username: string; // 3 a 50 caracteres
  password: string; // 8 a 72 caracteres (BCrypt solo usa 72 bytes)
  email: string; // formato email, hasta 100 caracteres
  roles?: Rol[]; // si no se manda, el backend asigna CLIENTE
  // Obligatorios si la cuenta es CLIENTE: security-service crea el cliente en shipment-service
  // (o lo vincula si ya existe con el mismo email) y guarda el DNI en el usuario y en el token.
  dni?: string; // 8 dígitos. También obligatorio con REPARTIDOR (LT4-40): va en el token
  nombre?: string; // solo letras, 3 a 30
  apellido?: string; // solo letras
  telefono?: string; // 10 dígitos
}

// Respuesta de POST /auth/register (201), GET /auth/me y GET /users (solo ADMIN)
export interface UserResponse {
  id: string; // UUID
  username: string;
  email: string;
  roles: Rol[]; // en Java es un Set: el orden no está garantizado
  dni?: string | null; // DNI del cliente vinculado; null si no es cliente
}
```

```ts
// src/features/usuarios/api/usuariosApi.ts
usuariosApi.registrar(dto: RegistroRequest): Promise<UserResponse>;
usuariosApi.me(): Promise<UserResponse>;
usuariosApi.listar(): Promise<UserResponse[]>;
```

| Código | Cuándo                                                                |
| ------ | --------------------------------------------------------------------- |
| 400    | Datos inválidos. `message` trae `"campo: motivo; …"` (sin `detalles`) |
| 403    | Pedir un rol privilegiado sin token de ADMIN                          |
| 409    | Username o email ya existentes                                        |
| 409    | El DNI ya tiene cuenta, o es de un cliente con otro email             |
| 503    | shipment-service no respondió al crear el cliente (no se crea cuenta) |

**Alta unificada de repartidor (LT4-40).** En `/usuarios/nuevo`, con rol REPARTIDOR el formulario
pide también la ficha (DNI, nombre, apellido, teléfono y vehículo). Primero se crea la ficha en
courier y después el usuario con el mismo DNI (400 si falta, 409 si ya tiene cuenta). Si falla el
usuario, se borra la ficha. "Nuevo repartidor" y `/repartidores/nuevo` llevan a esta pantalla. El DNI
viaja en el JWT, el gateway lo reenvía como `X-User-Dni` y courier lo usa para que un REPARTIDOR solo
vea y cambie su propia ficha (403 con la de otro).

Rutas: `/registro` (pública), `/perfil` (cualquier usuario logueado), `/usuarios` y `/usuarios/nuevo`
(permiso `usuarios.gestionar`). Después de registrarse, `/registro` navega a `/login` con
`state: { username }`, para que el login pueda precompletar el usuario si quiere.

---

## 5. Reglas

1. No usar `fetch` ni `axios` directo: todos los pedidos van por `httpClient`.
2. No usar `any`.
3. No editar archivos de otra feature.

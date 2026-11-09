# logitrack-frontend

SPA de LogiTrack: React + TypeScript + Vite, React Router (modo data) y axios.

## Requisitos

- Node 24 o superior
- El `api-gateway` corriendo (por defecto en `http://localhost:8066`)

## Puesta en marcha

```bash
cp .env.example .env   # ajustar VITE_API_BASE_URL si hace falta
npm ci
npm run dev            # http://localhost:5173
```

## Scripts

| Script                 | Qué hace                                  |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Servidor de desarrollo (puerto 5173 fijo) |
| `npm run build`        | Chequeo de tipos + build de producción    |
| `npm run typecheck`    | Solo chequeo de tipos (`tsc -b`)          |
| `npm run lint`         | Linter (oxlint)                           |
| `npm run format`       | Formatea con Prettier                     |
| `npm run format:check` | Verifica el formato (lo usa el CI)        |
| `npm test`             | Tests con Vitest (una corrida)            |
| `npm run test:watch`   | Tests en modo watch                       |

## Estructura

```
src/
  app/          router.tsx y navigation.ts (componen las rutas y el menú de cada feature)
  config/       env.ts: único lugar que lee variables de entorno
  features/     una carpeta por feature, cada una con routes.tsx y nav.ts
  pages/        páginas globales (NotFoundPage, SinPermisoPage)
  shared/       api, auth, guards, components y ui compartidos
  test/         setup de Vitest
```

Las convenciones y los contratos entre features están en `docs/CONTRATOS.md`.

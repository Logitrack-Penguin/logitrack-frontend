# logitrack-frontend

SPA de LogiTrack (React + TypeScript + Vite, React Router en modo data, axios). Consume el
api-gateway (`VITE_API_BASE_URL`, por defecto `http://localhost:8066`).

## Contratos y convenciones

Antes de escribir código, seguí `docs/CONTRATOS.md`. Si algo que vas a hacer lo contradice, gana el
documento.

@docs/CONTRATOS.md

## Comandos

- `npm run dev`: servidor de desarrollo en http://localhost:5173
- Antes de dar algo por terminado, todos deben pasar: `npm run format:check`, `npm run lint`,
  `npm run typecheck`, `npm test`, `npm run build`

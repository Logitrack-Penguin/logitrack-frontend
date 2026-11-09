// Único lugar que lee variables de entorno.
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8066',
};

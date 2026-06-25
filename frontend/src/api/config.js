// Centralized API base URL — read once from Vite env, with a sensible
// local-dev default. The Vite dev server injects VITE_* env vars at build time.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// Centralized API base URL — read once from Vite env, with a sensible
// local-dev default. The Vite dev server injects VITE_* env vars at build time.
//
// In production the deployed frontend is built with VITE_API_BASE_URL
// pointed at the live backend. Override it via .env / .env.production or
// by setting the `VITE_API_BASE_URL` repo secret used by the Pages workflow.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL
    || 'https://nexthome-kkr6.onrender.com'

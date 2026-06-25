import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The deployed site lives at https://<org>.github.io/nexthome/.
// Vite requires `base` to start with `/` and end with `/`. Using
// `/nextHome/` produces asset URLs like `/nextHome/assets/index-XXX.js`
// which resolve correctly under the Pages subpath. (Vite warns and
// can silently produce relative URLs if the leading slash is missing.)
export default defineConfig({
  plugins: [react()],
  base: '/nextHome/',
})

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { imagetools } from 'vite-imagetools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), imagetools()],
  server: {
    // Private source art and brainstorm mockups are not part of the app.
    watch: { ignored: ['**/reference/**', '**/.superpowers/**'] },
  },
})

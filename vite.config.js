import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/no-me-robaras-mi-identidad/",
  plugins: [react()],
})

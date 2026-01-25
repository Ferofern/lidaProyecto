import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/lidaProyecto/", // IMPORTANTE: Nombre exacto de tu repositorio
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
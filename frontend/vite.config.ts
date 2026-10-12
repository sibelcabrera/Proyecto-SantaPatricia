import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
//
// Dos formas de usar el frontend:
//  - npm run dev   -> modo desarrollo en http://localhost:5173 (para trabajar en el diseño)
//  - npm run build -> genera la versión final DENTRO del backend (backend/src/main/webapp/app).
//                     Así, con solo pulsar Run en NetBeans, el sistema completo se abre en
//                     http://localhost:8087/santapatricia/app/  sin tener que correr npm.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/santapatricia/app/' : '/',
  build: {
    outDir: '../backend/src/main/webapp/app',
    emptyOutDir: true,
  },
}))

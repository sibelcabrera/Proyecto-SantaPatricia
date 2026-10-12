/// <reference types="vite/client" />

// 📋 Tipado de las variables de entorno (.env).
// Si agregan una variable nueva al .env, decláranla también aquí
// para que TypeScript la reconozca. Siempre deben empezar con "VITE_".
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_USE_MOCKS?: string;
  readonly VITE_API_TIMEOUT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

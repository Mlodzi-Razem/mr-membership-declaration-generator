import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import viteBase64Loader from "./vite-base64-loader.ts";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteBase64Loader()],
})

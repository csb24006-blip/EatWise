import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // This ensures your assets (JS/CSS) load correctly from the subfolder
  base: '/EatWise/', 
  plugins: [react()],
})
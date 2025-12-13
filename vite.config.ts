import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // 允许代码中通过 process.env.DASHSCOPE_API_KEY 访问
      'process.env.DASHSCOPE_API_KEY': JSON.stringify(env.DASHSCOPE_API_KEY),
    },
  }
})
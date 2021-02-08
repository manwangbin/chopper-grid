import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'

import { defineConfig } from 'vite'

/**
 * https://vitejs.dev/config/
 * @type {import('vite').UserConfig}
 */
export default defineConfig ({
  alias: {
    '@': path.resolve(__dirname, 'src')
  },

  plugins: [
    vue(),
    vueJsx()
  ],

  build: {
    assetsDir: path.resolve(__dirname, "examples/assets"),

    rollupOptions: {
      input: path.resolve(__dirname, 'examples/main.ts'),
      output: {
        entryFileNames: 'entry-[name].js'
      }
    }
  }
});

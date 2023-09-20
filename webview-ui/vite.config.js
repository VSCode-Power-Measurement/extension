import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			'@': new URL('./src', import.meta.url).pathname
		}
	},
	build: {
		outDir: '../webview-dist',
		rollupOptions: {
			output: {
				entryFileNames: `[name].js`,
				chunkFileNames: `[name].js`,
				assetFileNames: `[name].[ext]`,
			},
		},
	},
})

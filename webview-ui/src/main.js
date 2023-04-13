import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'

const pinia = createPinia()

if (typeof acquireVsCodeApi !== 'undefined') {
	// eslint-disable-next-line
	window.vscode = acquireVsCodeApi()
}

createApp(App)
	.use(pinia)
	.mount('#app')
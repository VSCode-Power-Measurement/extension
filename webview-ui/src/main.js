import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import ActiveMeasuring from './ActiveMeasuring.vue'

const pinia = createPinia()

if (typeof acquireVsCodeApi !== 'undefined') {
	// eslint-disable-next-line
	window.vscode = acquireVsCodeApi()

	window.addEventListener('message', event => {
		const message = event.data
		if (message.command !== 'setup') { return }
		switch (message.type) {
		case 'activeMeasuring':
			createApp(ActiveMeasuring)
				.use(pinia)
				.mount('#app')
			break
		}
	})

	window.vscode.postMessage({
		command: 'setup',
	})
} else {
	createApp(ActiveMeasuring)
		.use(pinia)
		.mount('#app')
}
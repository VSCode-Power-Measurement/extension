import { createApp } from 'vue'
import './style.css'
import ActiveMeasuring from './ActiveMeasuring.vue'
import store from './stores/store.js'

if (typeof acquireVsCodeApi !== 'undefined') {
	// eslint-disable-next-line
	window.vscode = acquireVsCodeApi()

	window.addEventListener('message', event => {
		const message = event.data
		if (message.command !== 'setup') { return }
		switch (message.type) {
		case 'activeMeasuring':
			createApp(ActiveMeasuring)
				.use(store)
				.mount('#app')
			break
		}
	})

	window.vscode.postMessage({
		command: 'setup',
	})
} else {
	createApp(ActiveMeasuring)
		.use(store)
		.mount('#app')
	window.store = store
}
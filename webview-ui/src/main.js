import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import ActiveMeasuring from './ActiveMeasuring.vue'

const pinia = createPinia()
const type = document.getElementById('app').attributes.type.value
console.log(type)
console.log(type === 'measuring')

if (typeof acquireVsCodeApi !== 'undefined') {
	// eslint-disable-next-line
	window.vscode = acquireVsCodeApi()
}

switch (type) {
case 'measuring':
	createApp(ActiveMeasuring)
		.use(pinia)
		.mount('#app')
	break
case 'measurement':
	createApp(PreviousMeasurement)
		.use(pinia)
		.mount('#app')
	break
}:
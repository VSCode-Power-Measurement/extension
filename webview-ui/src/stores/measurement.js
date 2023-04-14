import { reactive } from 'vue'
import { defineStore } from 'pinia'

export const useMeasurement = defineStore('measurement', {
	state: () => {
		const previousState = window.vscode.getState()
		if (previousState) {
			return previousState
		}
		return {
			process: "",
			dateTime: "",
			values: [],
			maximum: 0,
			total: 0,
			length: 0,
		}
	},
	actions: {
		addValue(value) {
			this.values.push(value)
			this.maximum = Math.max(this.maximum, value)
			this.total += value
			this.length += 1
			this.saveState()
		},
		set(data) {
			this.process = data.process
			this.dateTime = data.dateTime
			this.values = data.values
			this.maximum = data.maximum
			this.total = data.total
			this.length = data.length
			this.saveState()
		},
		saveState() {
			window.vscode.setState({
				process: this.process,
				dateTime: this.dateTime,
				values: this.values,
				maximum: this.maximum,
				total: this.total,
				length: this.length,
			})
		}
	},
})


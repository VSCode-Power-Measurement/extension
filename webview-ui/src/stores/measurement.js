import { reactive } from 'vue'
import { defineStore } from 'pinia'

export const useMeasurement = defineStore('measurement', {
	state: () => {
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
		},
		set(data) {
			this.process = data.process
			this.dateTime = data.dateTime
			this.values = data.values
			this.maximum = data.maximum
			this.total = data.total
			this.length = data.length
		}
	},
})


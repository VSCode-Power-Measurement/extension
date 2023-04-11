import { reactive } from 'vue'
import { defineStore } from 'pinia'

export const useActiveMeasurement = defineStore('activeMeasurement', {
	state: () => {
		return {
			consumptions: [],
			maximum: 0,
			total: 0,
			length: 0,
		}
	},
	actions: {
		addMeasurement(measurement) {
			this.consumptions.push(measurement)
			if (measurement > this.maximum) {
				this.maximum = measurement
			}
			this.total += measurement
			this.length += 1
		},
	},
})


import { createStore } from 'vuex'

const store = createStore({
	state() {
		return {
			size: 10,
			maxPossible: 100,
			measurements: [],
			max: 0,
			maxIndex: 0,
			sum: 0,
			count: 0,
		}
	},
	mutations: {
		addMeasurement(state, measurement) {
			state.measurements = [...state.measurements, measurement].slice(-state.size)
			if (measurement > state.max) {
				state.max = measurement
				state.maxIndex = state.measurements.length
			}
			state.sum += measurement
			state.count += 1
		},
	},
})

export default store

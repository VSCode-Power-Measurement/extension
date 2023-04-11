<script setup>
import { useActiveMeasurement } from '@/stores/activeMeasurement'
import PowerConsumptionGraph from './components/PowerConsumptionGraph.vue'

const activeMeasurement = useActiveMeasurement()

window.addEventListener('message', event => {
	const message = event.data
	switch (message.command) {
	case 'measurement':
		activeMeasurement.addMeasurement(message.data)
		break
	}
})
</script>

<template>
	<PowerConsumptionGraph
		:consumptions="activeMeasurement.consumptions"
		:maximum="activeMeasurement.maximum"
		:total="activeMeasurement.total"
		:length="activeMeasurement.length"
	/>
</template>

<style scoped>
	#app {
		height: 100vh;
	}
</style>

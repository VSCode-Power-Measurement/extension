<script setup>
import { useMeasurement } from '@/stores/measurement'
import { onMounted } from 'vue'
import PowerConsumptionGraph from './components/PowerConsumptionGraph.vue'
import MeasurementTitle from './components/MeasurementTitle.vue'

const type = document.getElementById('app').attributes.type.value

const measurement = useMeasurement()

window.addEventListener('message', event => {
	const message = event.data
	switch (message.command) {
	case 'set':
		measurement.set(message.data)
		break	
	case 'addValue':
		measurement.addValue(message.data)
		break
	}
})
</script>

<template>
	<MeasurementTitle v-if="type === 'measuring'" />
	<div id="measurement-container">
		<PowerConsumptionGraph />
	</div>
</template>

<style scoped>
	#measurement-container {
		height: 90vh;
	}
</style>

<script setup>
import { computed } from 'vue'
import { useMeasurement } from '../stores/measurement'
const measurement = useMeasurement()

const title = computed(() => {
	let average = measurement.total / measurement.length
	average = Number.isNaN(average) ? 0 : average

	if (measurement.process === "") {
		return "Press the start button to start a measurement"
	}
	return measurement.process + ' @ ' + measurement.dateTime + " [average: " + average.toFixed(4).slice(0, 4) + "W | maximum: " + measurement.maximum.toFixed(4).slice(0, 4) + "W]"
})
</script>

<template>
	<span>{{ title }}</span>
</template>

<style scoped>
span {
  white-space: pre;
}
</style>

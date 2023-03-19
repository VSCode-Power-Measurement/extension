<script setup>
import { useStore } from 'vuex'
import PowerConsumptionGraph from './components/PowerConsumptionGraph.vue'

const store = useStore()

window.addEventListener('message', event => {
	const message = event.data
	switch (message.command) {
	case 'measurement':
		store.commit('addMeasurement', message.data)
		break
	}
})
</script>

<template>
	<PowerConsumptionGraph />
</template>

<style scoped>
</style>

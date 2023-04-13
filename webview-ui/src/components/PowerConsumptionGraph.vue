<script setup>
import { reactive, computed, toRaw } from 'vue'
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { useMeasurement } from '../stores/measurement'

const measurement = useMeasurement()

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
)

const colors = reactive({
	foreground: getComputedStyle(document.documentElement).getPropertyValue('--vscode-foreground') || '#FFF',
})

const observer = new MutationObserver(mutationsList => {
	mutationsList.forEach(mutation => {
		if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
			const newStyles = window.getComputedStyle(document.documentElement)
			const foreground = newStyles.getPropertyValue('--vscode-foreground') || '#FFF'
			if (foreground !== colors.foreground) {
				colors.foreground = foreground
			}
		}
	})
})

observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] })

const data = computed(() => {
	measurement.length
	const {...dataobject} = measurement.values

	return {
		// labels: measurement.index.nested,
		datasets: [
			{
				label: 'Power Consumption',
				backgroundColor: '#FFA500',
				data: dataobject,
				borderWidth: 1,
				borderColor: '#FFA500',
				fill: false,
				pointRadius: 1,
			}
		]
	}
})

const options = computed(() => { return {
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		title: {
			display: false,
			color: colors.foreground,
			text: `Average Power Consumption: ${measurement.maximum / measurement.values.length} W`,
		},
		legend: {
			display: false,
			position: 'top',
			align: 'end',
			labels: {
				color: colors.foreground,
			}
		}
	},
	scales: {
		x: {
			title: {
				display: true,
				text: 'time since start (s)',
				color: colors.foreground,
			},
			ticks: {
				color: colors.foreground,
			},
			grid: {
				color: colors.foreground,
			},
		},
		y: {
			title: {
				display: true,
				text: 'power consumption (W)',
				color: colors.foreground,
			},
			min: 0,
			max: measurement.maximum,
			ticks: {
				color: colors.foreground,
			},
			grid: {
				color: colors.foreground,
			},
		}
	},
}})
</script>

<template>
	<Line
		:data="data"
		:options="options"
	/>
</template>

<style scoped>
</style>

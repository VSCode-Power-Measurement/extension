<script setup>
import { reactive, computed } from 'vue'
import { useStore } from 'vuex'
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

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
)

const store = useStore()

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

let data = computed(() => { 
	let powerConsumptionMeasurements = store.state.measurements
	return {
		labels: Array.from({ length: powerConsumptionMeasurements.length }, (_, index) => index + 1 - powerConsumptionMeasurements.length),
		datasets: [
			{
				label: 'Power Consumption',
				backgroundColor: '#FFA500',
				data: powerConsumptionMeasurements,
				borderWidth: 1,
				borderColor: '#FFA500',
				fill: false,
				pointRadius: 1,
			}
		]
	}})

function getMaxWithIndex(arr) {
	let max = arr[0]
	let index = 0

	for (let i = 1; i < arr.length; i++) {
		if (arr[i] > max) {
			max = arr[i]
			index = i
		}
	}

	return {max, index}
}

let options = computed(() => { return {
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		title: {
			display: false,
			color: colors.foreground,
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
			ticks: {
				color: colors.foreground,
			},
			grid: {
				color: colors.foreground,
			},
		},
		y: {
			min: 0,
			max: store.state.maxPossible,
			ticks: {
				color: colors.foreground,
			},
			grid: {
				color: colors.foreground,
			},
		}
	}
}})

const maxLinePlugin = {
	id: 'max-value',
	beforeInit: ({ data, options }) => {
		const totalPower = data.datasets[0].data.reduce((total, datapoint) => total + datapoint, 0)
		const averagePower = totalPower / data.datasets[0].data.length
		const titleText = `Average Power Consumption: ${averagePower.toFixed(2)} W`
		options.plugins.title.text = titleText
	},
	afterDatasetDraw: ({ ctx, chartArea, scales: { x, y } }) => {
		const maxPosy = y.getPixelForValue(store.state.max)

		ctx.beginPath()
		ctx.moveTo(chartArea.left, maxPosy)
		ctx.lineTo(chartArea.right, maxPosy)
		ctx.strokeStyle = '#FF0000'
		ctx.stroke()

		const lastVal = store.state.measurements[store.state.measurements.length - 1]
		const lastPosy = y.getPixelForValue(lastVal)
		const lastPosx = x.getPixelForValue(store.state.measurements.length - 1)

		ctx.fillStyle = '#FFA500'
		ctx.fillText(`${lastVal}W`, lastPosx - 20, lastPosy + 10)
	}
}

ChartJS.register(maxLinePlugin)
</script>

<template>
	<Line
		:data="data"
		:options="options"
	/>
</template>

<style scoped>
</style>

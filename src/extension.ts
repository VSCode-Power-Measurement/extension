import * as vscode from 'vscode'
import { MeasuringViewProvider } from './views/MeasuringViewProvider'
import { Measurer } from './Measurer'
import { MeasurementProvider } from './views/MeasurementProvider'

export function activate(context: vscode.ExtensionContext) {

	const measuringViewProvider = new MeasuringViewProvider(context.extensionUri)
	const measurementProvider = new MeasurementProvider(measuringViewProvider)
	const measurer = new Measurer(measurementProvider)

	const measurementTreeView = vscode.window.createTreeView("powerMeasurement.resultsView", { treeDataProvider: measurementProvider})

	measurementTreeView.onDidChangeSelection((e) => {
		const selectedNode = e.selection[0]
		selectedNode.openPanel(context.extensionUri)
	})

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(MeasuringViewProvider.viewType, measuringViewProvider))

	context.subscriptions.push(
		vscode.commands.registerCommand('powerMeasurement.startMeasurement', () => {
			measurer.start()
		}))

	context.subscriptions.push(
		vscode.commands.registerCommand('powerMeasurement.stopMeasurement', () => {
			measurer.stop()
		}))

	context.subscriptions.push(
		vscode.commands.registerCommand('powerMeasurement.hookStopStart', () => {
			measurer.hook()
		}))

	context.subscriptions.push(
		vscode.commands.registerCommand('powerMeasurement.unhookStopStart', () => {
			measurer.unhook()
		}))

	context.subscriptions.push(
		vscode.commands.registerCommand('powerMeasurement.openMeasurements', () => {
			measuringViewProvider.open()
		}))

	context.subscriptions.push(
		vscode.commands.registerCommand('powerMeasurement.saveMeasurements', () => {
			measuringViewProvider.save()
		}))


	context.subscriptions.push(
		vscode.commands.registerCommand('powerMeasurement.clearMeasurements', () => {
			measuringViewProvider.clear()
		}))

	context.subscriptions.push(
		vscode.debug.onDidStartDebugSession((_) => {
			if (measurer.isHooked()) {
				measurer.start()
			}
		}))

	context.subscriptions.push(
		vscode.debug.onDidTerminateDebugSession((_) => {
			if (measurer.isHooked()) {
				measurer.stop()
			}
		}))
}

// export function deactivate() {}

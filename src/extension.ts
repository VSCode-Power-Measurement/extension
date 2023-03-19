import * as vscode from 'vscode'
import { MeasuringViewProvider } from './views/MeasuringViewProvider'
import { Measurer } from './Measurer'
import { MeasurementProvider } from './views/MeasurementProvider'

export function activate(context: vscode.ExtensionContext) {

	const measurer = new Measurer()
	const provider = new MeasuringViewProvider(context.extensionUri, measurer)
	const measurementProvider = new MeasurementProvider()

	const measurementTreeView = vscode.window.createTreeView("powerMeasurement.resultsView", { treeDataProvider: measurementProvider})

	measurementTreeView.onDidChangeSelection((e) => {
		const selectedNode = e.selection[0]
		console.log(selectedNode.id)
	})

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(MeasuringViewProvider.viewType, provider))

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
			provider.open()
		}))

	context.subscriptions.push(
		vscode.commands.registerCommand('powerMeasurement.saveMeasurements', () => {
			provider.save()
		}))

	
	context.subscriptions.push(
		vscode.commands.registerCommand('powerMeasurement.clearMeasurements', () => {
			provider.clear()
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

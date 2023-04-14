import * as vscode from 'vscode'
import { MeasuringViewProvider } from './views/MeasuringViewProvider'
import { Measurer } from './Measurer'
import { MeasurementProvider } from './views/MeasurementProvider'
import fs = require('fs')
import { Measurement } from './views/objects/Measurement'

export function activate(context: vscode.ExtensionContext) {
	const globalStoragePath = context.globalStorageUri.fsPath
	if (!fs.existsSync(globalStoragePath)) {
		fs.mkdirSync(globalStoragePath)
	}

	const measuringViewProvider = new MeasuringViewProvider(context.extensionUri)
	const measurementProvider = new MeasurementProvider(measuringViewProvider, context.globalStorageUri)
	const measurer = new Measurer(measurementProvider, context.extensionPath)

	const measurementTreeView = vscode.window.createTreeView("powerMeasurement.measurementView", { treeDataProvider: measurementProvider})

	measurementTreeView.onDidChangeSelection((e) => {
		const selectedNode = e.selection[0]
		selectedNode.openPanel(context.extensionUri)
	})

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(MeasuringViewProvider.viewType, measuringViewProvider))

	measurementProvider.loadMeasurements()

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
			measurementProvider.open()
		}))

	context.subscriptions.push(
		vscode.commands.registerCommand('powerMeasurement.saveMeasurements', () => {
			measurementProvider.save()
		}))


	context.subscriptions.push(
		vscode.commands.registerCommand('powerMeasurement.clearMeasurements', () => {
			measurementProvider.clearMeasurements()
		}))


	context.subscriptions.push(
		vscode.commands.registerCommand('powerMeasurement.deleteMeasurement', (measurement: Measurement) => {
			measurementProvider.deleteMeasurement(measurement)
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

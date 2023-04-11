import * as vscode from 'vscode'
import { Measurement } from './objects/Measurement'
import { MeasuringViewProvider } from './MeasuringViewProvider'

export class MeasurementProvider implements vscode.TreeDataProvider<Measurement> {
	private measurements: Measurement[] = []
	private activeMeasurement: Measurement | null = null

	constructor(private measuringViewProvider :MeasuringViewProvider) {
	}

	startNewMeasurement() {
		this.activeMeasurement = new Measurement("kaas")
		this.measurements.push(this.activeMeasurement)
	}

	addValue(consumption: number) {
		this.activeMeasurement?.addMeasurement(consumption)
		this.measuringViewProvider.sendMeasurement(consumption)
	}

	getTreeItem(element: Measurement): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element
	}

	getChildren(): vscode.ProviderResult<Measurement[]> {
		return Promise.resolve(this.measurements)
	}
}
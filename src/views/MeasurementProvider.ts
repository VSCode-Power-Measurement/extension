import * as vscode from 'vscode'
import { Measurement } from './objects/Measurement'
import { MeasuringViewProvider } from './MeasuringViewProvider'

export class MeasurementProvider implements vscode.TreeDataProvider<Measurement> {
	private measurements: Measurement[] = []
	private activeMeasurement: Measurement | null = null
	private _onDidChangeTreeData: vscode.EventEmitter<Measurement | undefined | null | void> = new vscode.EventEmitter<Measurement | undefined | null | void>()
	readonly onDidChangeTreeData: vscode.Event<Measurement | undefined | null | void> = this._onDidChangeTreeData.event

	constructor(private measuringViewProvider :MeasuringViewProvider) {
	}

	startNewMeasurement(process: string) {
		const dateTime = new Date()
		this.activeMeasurement = new Measurement(process, dateTime)
		this.measuringViewProvider.set({
			process: process,
			dateTime: dateTime,
			values: [],
			maximum: 0,
			total: 0,
			length: 0,
		})
	}

	endMeasurement() {
		if (this.activeMeasurement) {
			this.measurements.push(this.activeMeasurement)
		}
		this.refresh()
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

	refresh(): void{
		this._onDidChangeTreeData.fire()
	}
}
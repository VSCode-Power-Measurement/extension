import * as vscode from 'vscode'
import { Measurement } from './objects/Measurement'
import { MeasuringViewProvider } from './MeasuringViewProvider'
import path = require('path')
import fs = require('fs')

export class MeasurementProvider implements vscode.TreeDataProvider<Measurement> {
	private measurements: Measurement[] = []
	private activeMeasurement: Measurement | null = null
	private _onDidChangeTreeData: vscode.EventEmitter<Measurement | undefined | null | void> = new vscode.EventEmitter<Measurement | undefined | null | void>()
	readonly onDidChangeTreeData: vscode.Event<Measurement | undefined | null | void> = this._onDidChangeTreeData.event

	constructor(private measuringViewProvider: MeasuringViewProvider, private storageUri: vscode.Uri) {
	}

	static getFileName(measurement: Measurement) {
		return ((measurement.process + ' @ ' + measurement.dateTime).replace(/[^a-zA-Z0-9]/g, ''))

	}

	open() {
		//todo
	}

	save() {
		//todo
	}
	
	deleteMeasurement(measurement: Measurement) {
		const index = this.measurements.indexOf(measurement)
		this.measurements.splice(index, 1)
		
		const fileName = MeasurementProvider.getFileName(measurement)
		const filePath = path.join(this.storageUri.fsPath, fileName)
		fs.unlink(filePath, (err) => {
			if (err) {
				console.error(err)
			}
		})

		this.refresh()
	}

	clearMeasurements() {
		fs.readdir(this.storageUri.fsPath, (err, files) => {
			if (err) {
				console.error(err)
				return
			}
			if (files === undefined) {
				return
			}
			files.forEach((file) => {
				const filePath = path.join(this.storageUri.fsPath, file)
				fs.unlink(filePath, (err) => {
					if (err) {
						console.error(err)
					}
				})
			})
		})
		this.measurements = []
		this.refresh()
	}

	startNewMeasurement(process: string) {
		const dateTime = new Date().toLocaleString()
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
			this.saveMeasurement(this.activeMeasurement)
		}
		this.refresh()
	}

	loadMeasurements() {
		this.measurements = []
		fs.readdir(this.storageUri.fsPath, (err, files) => {
			if (err) {
				console.error(err)
				return
			}
			if (files === undefined) {
				return
			}
			files.forEach((file) => {
				const filePath = path.join(this.storageUri.fsPath, file)
				fs.readFile(filePath, 'utf-8', (_, data) => {
					const measuremment = JSON.parse(data)
					Object.setPrototypeOf(measuremment, Measurement.prototype)
					this.measurements.push(measuremment)
				})
			})
		})
		this.refresh()
	}

	saveMeasurement(measurement: Measurement) {
		const fileName = MeasurementProvider.getFileName(measurement)
		const filePath = path.join(this.storageUri.fsPath, fileName)
		const fileContent = JSON.stringify(measurement)

		fs.writeFile(filePath, fileContent, (err) => {
			if (err) {
				console.error(err)
			}
		})
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

	refresh(): void {
		this._onDidChangeTreeData.fire()
	}
}
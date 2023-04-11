import * as vscode from 'vscode'

export class Measurement extends vscode.TreeItem {
	public total = 0
	public maximum = 0
	public consumptions: number[] = []

	public constructor(id: string){
		super("", vscode.TreeItemCollapsibleState.Collapsed)
		super.label = "Measurement " + this.getAverage() + "/" + this.maximum
		super.id = id
	}

	public getAverage() {
		return this.total / this.consumptions.length
	}

	public addMeasurement(consumption: number) {
		this.consumptions.push(consumption)
		this.total += consumption
		this.maximum = Math.max(this.maximum, consumption)
	}
}
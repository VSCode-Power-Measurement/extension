import * as vscode from 'vscode'

export class Measurement extends vscode.TreeItem{
	public average = 0
	public maximum = 0
	public consumption: number[] = []

	public constructor(id: string){
		super("", vscode.TreeItemCollapsibleState.Collapsed)
		super.label = "Measurement " + this.average + "/" + this.maximum
		super.id = id
	}
}
import * as vscode from 'vscode'

export class Measurement extends vscode.TreeItem{
	public average = "46"
	public maximum = "60"

	public constructor(id: string){
		super("", vscode.TreeItemCollapsibleState.Collapsed)
		super.label = "Measurement " + this.average + "/" + this.maximum
		super.id = id
	}
}
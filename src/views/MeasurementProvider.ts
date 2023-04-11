import * as vscode from 'vscode'
import { Measurement } from './objects/Measurement'

export class MeasurementProvider implements vscode.TreeDataProvider<Measurement> {
	private measurements: Measurement[] = []

	getTreeItem(element: Measurement): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element
	}

	getChildren(): vscode.ProviderResult<Measurement[]> {
		return Promise.resolve([
			new Measurement("test1"),
			new Measurement("test2")
		])
	}
}
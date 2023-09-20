import * as vscode from 'vscode'
import { getUri } from "../../utilities/getUri"
import { getNonce } from "../../utilities/getNonce"

export class Measurement extends vscode.TreeItem {
	public values: number[] = []
	public maximum = 0
	public total = 0
	public length = 0

	public title: string

	public constructor(
		public process: string,
		public dateTime: string
	){
		super("", vscode.TreeItemCollapsibleState.None)
		this.title = this.getTitle()
		super.label =  this.title
		// super.id = "measurement"
	}

	public getTitle() {
		return this.process + ' @ ' + this.dateTime + " [average: " + this.getAverage().toFixed(4).slice(0, 4) + "W | maximum: " + this.maximum.toFixed(4).slice(0, 4) + "W]"
	}

	public getAverage() {
		const avg = this.total / this.length
		return (isNaN(avg) ? 0 : avg)
	}

	public addMeasurement(consumption: number) {
		this.values.push(consumption)
		this.total += consumption
		this.maximum = Math.max(this.maximum, consumption)
		this.length += 1
		this.title = this.getTitle()
		super.label =  this.title
	}

	public openPanel(extensionUri: vscode.Uri) {
		const panel = vscode.window.createWebviewPanel(
			'my-webview',
			this.title,
			vscode.ViewColumn.One,
			{
				// Enable scripts in the webview
				enableScripts: true
			},
		)
		
		
		panel.webview.html = this._getHtmlForWebview(panel.webview, extensionUri)
		panel.webview.postMessage({
			command: 'set',
			data: {
				values: this.values,
				maximum: this.maximum,
				total: this.total,
				length: this.length,
			},
		})
	}

	private _getHtmlForWebview(webview: vscode.Webview, extensionUri: vscode.Uri) {
		// Get references to local files
		const scriptUri = getUri(webview,  extensionUri, ["webview-dist", "index.js"])
		const stylesUri = getUri(webview, extensionUri, ["webview-dist", "index.css"])

		// Use a nonce to only allow a specific script to be run.
		const scriptNonce = getNonce()
		const styleNonce = getNonce()

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
		
				<meta http-equiv="Content-Security-Policy" content="
					default-src 'none';
					font-src ${webview.cspSource};
					style-src ${webview.cspSource} 'nonce-${styleNonce}';
					script-src ${webview.cspSource} 'nonce-${scriptNonce}';
				">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${stylesUri}" rel="stylesheet">
				<style nonce="${styleNonce}">
					#app {
						height: calc(100vh - 20px);
					}
				</style>

				<title>Measurement</title>
			</head>
			<body>
				<div id="app" type="measurement"></div>
				<script type="module" nonce="${scriptNonce}" src="${scriptUri}"></script>
			</body>
			</html>`
	}
}
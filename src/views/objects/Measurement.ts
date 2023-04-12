import * as vscode from 'vscode'
import { getUri } from "../../utilities/getUri"
import { getNonce } from "../../utilities/getNonce"

export class Measurement extends vscode.TreeItem {
	public total = 0
	public maximum = 0
	public consumptions: number[] = []
	public title: string

	public constructor(){
		super("", vscode.TreeItemCollapsibleState.None)
		this.title = "[average: " + this.getAverage() + "W | maximum: " + this.maximum + "W]"
		super.label =  this.title
		// super.id = id
	}

	public getAverage() {
		return this.total / this.consumptions.length | 0
	}

	public addMeasurement(consumption: number) {
		this.consumptions.push(consumption)
		this.total += consumption
		this.maximum = Math.max(this.maximum, consumption)
	}

	public openPanel(extensionUri: vscode.Uri) {
		const panel = vscode.window.createWebviewPanel(
			'my-webview',
			this.title,
			vscode.ViewColumn.One,
			{}
		)
		
		
		panel.webview.html = this._getHtmlForWebview(panel.webview, extensionUri)
	}

	private _getHtmlForWebview(webview: vscode.Webview, extensionUri: vscode.Uri) {
		// Get references to local files
		const scriptUri = getUri(webview,  extensionUri, ["webview-ui", "dist", "assets", "index.js"])
		const stylesUri = getUri(webview, extensionUri, ["webview-ui", "dist", "assets", "index.css"])

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
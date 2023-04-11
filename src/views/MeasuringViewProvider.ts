import * as vscode from 'vscode'
import { getUri } from "../utilities/getUri"
import { getNonce } from "../utilities/getNonce"

export class MeasuringViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'powerMeasurement.measuringView'

	private _view?: vscode.WebviewView

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) {
	}

	public sendMeasurement(consumption: number) {
		this._view?.webview.postMessage({command: 'measurement', data: consumption})
	}

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		_context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		}

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview)

		webviewView.webview.onDidReceiveMessage(data => {
			if (data.command === 'setup') {
				webviewView.webview.postMessage({command: 'setup', type: 'activeMeasuring'})
			}
		})
	}

	public start() {
		if (this._view) {
			this._view.show?.(true)
			this._view.webview.postMessage({ type: 'start' })
		}
	}

	public stop() {
		if (this._view) {
			this._view.show?.(true)
			this._view.webview.postMessage({ type: 'stop' })
		}
	}

	public open() {
		if (this._view) {
			this._view.show?.(true)
			this._view.webview.postMessage({ type: 'open' })
		}
	}

	public save() {
		if (this._view) {
			this._view.show?.(true)
			this._view.webview.postMessage({ type: 'save' })
		}
	}

	public clear() {
		if (this._view) {
			this._view.webview.postMessage({ type: 'clear' })
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		// Get references to local files
		const scriptUri = getUri(webview, this._extensionUri, ["webview-ui", "dist", "assets", "index.js"])
		const stylesUri = getUri(webview, this._extensionUri, ["webview-ui", "dist", "assets", "index.css"])

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce()

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<meta http-equiv="Content-Security-Policy" content="
					default-src 'none';
				 	font-src ${webview.cspSource};
					style-src ${webview.cspSource};
					script-src 'nonce-${nonce}';
				">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${stylesUri}" rel="stylesheet">

				<title>Measurement</title>
			</head>
			<body>
				<div id="app" style="height: 100vh"></div>
				<script type="module" nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`
	}
}

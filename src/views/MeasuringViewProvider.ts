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
		this._view?.webview.postMessage({command: 'addValue', data: consumption})
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
	}

	public set(data: object) {
		if (this._view) {
			this._view.show?.(true)
			this._view.webview.postMessage({ command: 'set', data })
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		// Get references to local files
		const scriptUri = getUri(webview, this._extensionUri, ["webview-ui", "dist", "assets", "index.js"])
		const stylesUri = getUri(webview, this._extensionUri, ["webview-ui", "dist", "assets", "index.css"])

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
				<div id="app" type="measuring"></div>
				<script type="module" nonce="${scriptNonce}" src="${scriptUri}"></script>
			</body>
			</html>`
	}
}

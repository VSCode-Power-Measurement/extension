import * as vscode from 'vscode'
import * as child_process from 'child_process'

export class Measurer {
	private _measuring = false
	private _hooked = false
	private pid = ""

	constructor() {
		this.setMeasuring(false)
		this.setHooked(true)
	}

	setMeasuring(state: boolean) {
		this._measuring = state
		vscode.commands.executeCommand('setContext', 'powerMeasurement.measuring', state)
	}

	isMeasuring() {
		return this._measuring
	}

	setHooked(state: boolean) {
		this._hooked = state
		vscode.commands.executeCommand('setContext', 'powerMeasurement.hooked', state)
	}

	isHooked() {
		return this._hooked
	}

	async start() {
		if (this.isMeasuring()) {return}

		const selection = await this.pickProcess()

		// If a selection was made, log the PID to the console
		if (!selection) {return}
		
		console.log(`Selected process: ${selection.label}`)

		this.pid = selection.label

		this.setMeasuring(true)
	}

	stop() {
		if (!this.isMeasuring()) {return}


		this.setMeasuring(false)
	}

	hook() {
		if (this.isHooked()) {return}

		this.setHooked(true)
	}

	unhook() {
		if (!this.isHooked()) {return}


		this.setHooked(false)
	}

	async pickProcess() {
		// Use the child_process module to execute the "ps" command and get a list of running processes
		let processes = child_process.execSync('ps -axo pid,command').toString().split('\n')

		// Remove the first line (header) and any empty lines from the output
		processes = processes.filter(line => line.trim() !== '' && !line.includes('PID COMMAND'))

		// Create an array of QuickPickItems from the output, with the PID as the label and the command as the detail
		const items: vscode.QuickPickItem[] = processes.map(line => {
			const [pid, command] = line.trim().split(' ', 2)
			return { label: pid, detail: command }
		})

		// Show the etQuickPick to the user and wait for their selection
		return vscode.window.showQuickPick(items, { placeHolder: 'Select a process' })
	}
}
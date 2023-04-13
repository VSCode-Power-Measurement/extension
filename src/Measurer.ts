import * as vscode from 'vscode'
import * as child_process from 'child_process'
import { MeasurementProvider } from './views/MeasurementProvider'

export class Measurer {
	private _measuring = false
	private scaphandre: child_process.ChildProcessWithoutNullStreams | null = null
	private _hooked = false
	private pid = ""
	private orange = vscode.window.createOutputChannel("Orange")

	constructor(private measurementProvider: MeasurementProvider) {
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

		this.orange.appendLine(`Selected process: ${selection.label}`)

		this.pid = selection.label

		if (selection.detail !== undefined) {
			this.measurementProvider.startNewMeasurement(selection.detail)
		}
		this.spawnMeasurer()

		this.setMeasuring(true)
	}

	stop() {
		this.orange.appendLine(`Sop is called`)
		if (!this.isMeasuring()) {return}
		this.orange.appendLine(`We were running, stopping...`)

		if (!this.scaphandre || !this.scaphandre.pid) {
			this.orange.appendLine(`Scaphandre wasn't running`)
			return
		}

		// Dirty hack: scaphandre runs as root and runs as a child of sudo.
		// We have the PID of sudo, but killing sudo orphanes the children
		// We can kill the process group of sudo, but we don't have permission to kill scaphandre, as we aren't root.
		// The approach taken involves closing stdout to cause scaphandre to panic and exit.
		this.scaphandre.stdout.destroy()

		// Postpone calling `setMeasuring` to close event
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
			return { label: pid, detail: command}
		})

		// Show the etQuickPick to the user and wait for their selection
		return vscode.window.showQuickPick(items, { placeHolder: 'Select a process', matchOnDetail: true })
	}

	async spawnMeasurer() {
		this.scaphandre = child_process.spawn("sudo", ["-S", "scaphandre", "json", "-t", "18446744073709551615", "-s", "1", "--max-top-consumers", "15"])

		this.scaphandre.stdout.on('data', (data) => {
			this.orange.appendLine(data)
			const parsed = JSON.parse(data)

			const powerConsumption = parsed.consumers.find((el: any) => el.pid == this.pid)?.consumption ?? 0

			const watts = powerConsumption / 1000000
			this.orange.appendLine(`measured: ${watts}W`)
			
			this.measurementProvider.addValue(watts)
		})

		this.scaphandre.stderr.on('data', (data) => {
			this.orange.appendLine(`stderr output: ${data}`)
			if (`${data}`.startsWith("[sudo] password for")) {
				this.askPassword()
			}
		})

		this.scaphandre.on('close', (code) => {
			this.orange.appendLine(`child process exited with code ${code}`)

			this.setMeasuring(false)
			this.measurementProvider.endMeasurement()
		})
	}

	async askPassword() {
		const options: vscode.InputBoxOptions = {
			title: "Sudo password",
			password: true,
			prompt: "To read power measurements, we need root access. Please fill in your password.",
		}

		this.orange.appendLine(`Asking user for password...`)
		const password = await vscode.window.showInputBox(options)

		if (!this.scaphandre) {
			this.orange.appendLine(`Scaphandre somehow didn't start, ignoring`)
			return
		}

		this.scaphandre.stdin.write(`${password}\n`)
	}
}

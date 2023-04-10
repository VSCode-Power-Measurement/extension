import * as vscode from 'vscode'
import * as child_process from 'child_process'
import * as fs from 'fs'
import path = require('path')
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

		if (!await this.canRunScaphandre()) {return}

		const selection = await this.pickProcess()

		// If no selection was made, don't start
		if (!selection) {return}

		this.pid = selection.label
		this.orange.appendLine(`Selected process: ${this.pid}`)

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

	async canRunScaphandre() {
		const canAccess = (path: fs.PathLike, mode: number | undefined) => new Promise<boolean>((resolve) => {
			fs.access(path, mode, (err) => err ? resolve(false) : resolve(true))
		})

		const unsupported = async () => {
			const message = "Unfortunately your system doesn't seem to be compatible. Please ensure your device is compatibe and you've loaded the intel_rapl or intel_rapl_common kernel modules."
			const details = "This extension uses Scaphandre to measure power consumption. Please check if your system is [compatible with Scaphandre](https://hubblo-org.github.io/scaphandre-documentation/compatibility.html). This extension imposes some further limits on compatibility, most of which we hope to resolve in the future. Currently we only support the 'PowercapRAPL' sensor on linux devices not running in a virtual machine.\nIf you run this extension in a container, please ensure that '/sys/class/powercap' and '/proc' are bind-mounted from the host and readable in the container."
			const res = await vscode.window.showErrorMessage(message, {modal: true, detail: details})
			this.orange.appendLine(res || "empty")
			return false
		}
		const noAccess = async (_files: string[]) => {
			const message = `Unfortunately you don't have read access to the files we need in ${powercapDir}! You need sudo rights to fix this.`
			const details = `We need read access to all 'energy_uj' files in ${powercapDir}.`
			const buttons = [/* {title: "Fix automatically"}, */ {title: "Fix it myself", isCloseAffordance: true}]
			const res = await vscode.window.showErrorMessage(message, {modal: true, detail: details}, ...buttons)
			this.orange.appendLine(res?.title || "empty")
			return false
		}

		const powercapDir = "/sys/devices/virtual/powercap"

		// check if powercap is available and files are readable
		try {
			const files: string[] = []
			const canAccessAll: Promise<boolean>[] = []
			for await (const file of searchFiles(powercapDir, "energy_uj")) {
				// No read access to powercap files
				files.push(file)
				// Start statting the file
				canAccessAll.push(canAccess(file, fs.constants.R_OK))
			}
			// Wait for result of all stats
			// If one of them returns no access, show error message
			if (!(await Promise.all(canAccessAll)).every((el) => el)) { return noAccess(files) }
		} catch (err) {
			if (err && isErrnoException(err)) {
				switch (err.code) {
				case 'ENOENT':
					// Powercap folder doesn't exist
					return unsupported()
				}
			}

			// Either if was false, or switch didn't match, so rethrow
			throw err
		}

		return true
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

/// Breadth-first algorithm for recursively searching a folder for files with the specified name
async function* searchFiles(start: string, filename: string): AsyncGenerator<string> {
	const promises: Set<Promise<fs.Dirent[]>> = new Set()

	const ls = async (dir: string) => {
		const promise = fs.promises.readdir(dir, { withFileTypes: true })
		promises.add(promise)
		const result = await promise
		promises.delete(promise)
		return result
	}

	promises.add(ls(start))

	while (promises.size > 0) {
		const dirents = await Promise.race(promises)
		for (const dirent of dirents) {
			const res = path.resolve(start, dirent.name)
			if (dirent.isDirectory()) {
				promises.add(ls(res))
			} else if (dirent.name === filename) {
				yield res
			}
		}
	}
}

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
	return isArbitraryObject(error) &&
	error instanceof Error &&
		(typeof error.errno === "number" || typeof error.errno === "undefined") &&
		(typeof error.code === "string" || typeof error.code === "undefined") &&
		(typeof error.path === "string" || typeof error.path === "undefined") &&
		(typeof error.syscall === "string" || typeof error.syscall === "undefined")
}

type ArbitraryObject = { [key: string]: unknown; }

function isArbitraryObject(potentialObject: unknown): potentialObject is ArbitraryObject {
	return typeof potentialObject === "object" && potentialObject !== null
}

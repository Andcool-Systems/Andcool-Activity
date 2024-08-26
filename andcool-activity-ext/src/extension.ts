import axios from 'axios';
import * as vscode from 'vscode';

const generateRandomNumber = (length: number): number => {
	const min = Math.pow(10, length - 1);
	const max = Math.pow(10, length) - 1;
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

const API_URL = 'https://activity.andcool.ru';
const PERIOD = 30;
const activity_id = generateRandomNumber(6);
let API_KEY = '';
let interval: NodeJS.Timeout | null = null;

const startHeartbeat = () => {
	interval = setInterval(async () => {
		const editor = vscode.window.activeTextEditor;
		const workplace = vscode.workspace.workspaceFolders?.[0].uri.fsPath.split('\\').reverse()[0] ?? null;
		const isDebugging = vscode.debug.activeDebugSession !== undefined;
		const file_path = editor ? editor.document.fileName.split('\\').reverse()[0] : null;
		if (!API_KEY) return;

		const response = await axios.post(API_URL + '/heartbeat',
			{
				id: activity_id,
				workplace: workplace,
				file: file_path,
				debugging: isDebugging,
				editor: 'Visual Studio Code'
			},
			{
				headers: { Authorization: `Api-Key ${API_KEY}` },
				validateStatus: () => true
			}
		);
		if (response.status === 401) register();

	}, PERIOD * 1000);
}

const register = () => {
	const config = vscode.workspace.getConfiguration('andcool-activity-ext');
	axios.post(API_URL + '/register').then(async (response) => {
		if (response.status !== 201) {
			vscode.window.showErrorMessage('Could not register new activity!');
			return
		}
		await config.update('Api_Key', response.data.token, vscode.ConfigurationTarget.Global);
		await config.update('url', `${API_URL}/${response.data.code}`, vscode.ConfigurationTarget.Global);
		API_KEY = response.data.token;
		vscode.window.showInformationMessage('Successfully registered new activity! To open URL execute `Open activity URL` command');
	});
}

const endActivity = async () => {
	if (!API_KEY) return;
	await axios.post(API_URL + '/end',
		{ id: activity_id },
		{
			headers: { Authorization: `Api-Key ${API_KEY}` },
			validateStatus: () => true
		}
	)
}

export function activate(context: vscode.ExtensionContext) {
	console.log('[Andcool Activity][LOG] Enabled')
	const config = vscode.workspace.getConfiguration('andcool-activity-ext');
	const enabled = config.get<boolean>('enabled', true);
	API_KEY = config.get<string>('Api_Key', '');

	if (!API_KEY) {
		register();
	}

	const enable_command = vscode.commands.registerCommand('andcool-activity-ext.enable', async () => {
		await config.update('enabled', true, vscode.ConfigurationTarget.Workspace);
		!interval && startHeartbeat();
	});

	const disable_command = vscode.commands.registerCommand('andcool-activity-ext.disable', async () => {
		await config.update('enabled', false, vscode.ConfigurationTarget.Workspace);
		interval && clearInterval(interval);
		interval = null;
	});

	const openActivity = vscode.commands.registerCommand('andcool-activity-ext.open_url', async () => {
		vscode.env.openExternal(vscode.Uri.parse(config.get<string>('url', '')))
	});

	const api_set = vscode.commands.registerCommand('andcool-activity-ext.set_api_key', async (val) => {
		vscode.window.showInputBox({
			prompt: 'Andcool Activity: Enter your API key',
			placeHolder: '*************************',
			password: true
		}).then(async val => {
			if (!val) return;
			await config.update('Api_Key', val, vscode.ConfigurationTarget.Global);
			API_KEY = val;
		})
	});

	context.subscriptions.push(enable_command);
	context.subscriptions.push(disable_command);
	context.subscriptions.push(api_set);
	context.subscriptions.push(openActivity);

	if (enabled) {
		startHeartbeat();
	}
}

// This method is called when your extension is deactivated
export function deactivate() {
	!!interval && clearInterval(interval);
	endActivity();
}

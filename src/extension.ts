import * as vscode from 'vscode';
import { whetherStartLatexOCR, whetherStopLatexOCR } from './client_starter';
import { IMG_EXTS } from './client/latex_ocr/main';

export function activate(context: vscode.ExtensionContext) {


	let commandDisposable1 = vscode.commands.registerCommand('latex-pix.paste-latex-from-clipboard', async () => {
		vscode.commands.executeCommand("latex-pix.paste-latex-from-path", "$clipboard");
	});

	context.subscriptions.push(commandDisposable1);


	let commandDisposable2 = vscode.commands.registerCommand('latex-pix.paste-latex-from-open-path', () => {
		vscode.window.showOpenDialog({
			canSelectFolders: false,
			filters: {
				'Images': [...IMG_EXTS]
			}
		}).then((urls) => {
			if (urls) {
				const path = urls[0];
				vscode.commands.executeCommand("latex-pix.paste-latex-from-path", path.fsPath);
			}
		});
	});
	context.subscriptions.push(commandDisposable2);

	whetherStartLatexOCR(context);




	//vscode.languages.registerDocumentDropEditProvider({ language: 'latex', scheme: '*' },)

}

export function deactivate() {
	whetherStopLatexOCR();
}

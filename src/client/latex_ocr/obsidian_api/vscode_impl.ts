import { Editor, EditorPosition } from "./obsidian_api";
import * as vscode from 'vscode';

export class VscodeEditor implements Editor{
    editor: vscode.TextEditor;
    constructor(editor: vscode.TextEditor) {
        this.editor = editor;
    }
    getCursor(string?: 'from' | 'to' | 'head' | 'anchor'): EditorPosition {
        const range = string === "from" ? this.editor.selection.start
            : string === "to" ? this.editor.selection.end
            : this.editor.selection.start;
        return { line: range.line, ch: range.character };
    }
    replaceSelection(target: string): void {
        this.editor.insertSnippet(new vscode.SnippetString(target));
    }
    lineCount(): number {
        return this.editor.document.lineCount;
    }
    getLine(line: number): string {
        return this.editor.document.lineAt(line).text;
    }
    replaceRange(target: string, from: EditorPosition, to: EditorPosition): void {
        this.editor.edit((editBuilder) => {
            editBuilder.replace(new vscode.Range(
                new vscode.Position(from.line, from.ch),
                new vscode.Position(to.line, to.ch)),
                target);
        });
    }
    
}

export class Notice{
    constructor(message: string, duration?: number) {
        vscode.window.showInformationMessage(message);
    }
    hide() {
        
    }
}

export class Plugin{
    context: vscode.ExtensionContext;
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }
    addStatusBarItem(): StatusBarItem {
        const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.context.subscriptions.push(statusBar);
        return new StatusBarItem(statusBar);
    }
}

export class StatusBarItem{
    statusBarItem: vscode.StatusBarItem;
    constructor(ststatusBarItem: vscode.StatusBarItem) {
        this.statusBarItem = ststatusBarItem;
    }
    createEl(element: string, content: { text: string }) {
        if (!this.statusBarItem.text) {this.statusBarItem.text = content.text;}
        else {this.statusBarItem.text += content.text;}
    }
    setText(text:string) {
        this.statusBarItem.text = text;
    }
    hide() {
        this.statusBarItem.hide();
    }
    show() {
        this.statusBarItem.show();
    }
}


export function sleep(time:number) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}

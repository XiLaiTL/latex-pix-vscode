import * as vscode from 'vscode';

export interface EditorPosition{
    line: number,
    ch: number 
}
export interface Editor{
    getCursor(string?: 'from' | 'to' | 'head' | 'anchor'): EditorPosition
    replaceSelection(target:string): void
    lineCount(): number
    getLine(line:number): string
    replaceRange(target: string, from: EditorPosition, to: EditorPosition): void

}




import { ExtensionContext } from "vscode";
import LatexOCR from "./client/latex_ocr/main";
import * as vscode from 'vscode';
import { getConfig, onConfigChange } from "./config/configuration";

let LatexOCRPlugin: LatexOCR;

export function whetherStartLatexOCR(context: ExtensionContext) {
    if (getConfig("ocr.activate", Boolean(true))) {
        if (!LatexOCRPlugin) {
            LatexOCRPlugin = new LatexOCR(context);
            LatexOCRPlugin.onload().then(() => {});
        }
    }

    onConfigChange<boolean>(context, "ocr.activate", (newValue) => {
        if (newValue) {
            if (!LatexOCRPlugin) {
                LatexOCRPlugin = new LatexOCR(context);
                LatexOCRPlugin.onload().then(() => {});
            }
            else {
                LatexOCRPlugin.onshow();
            }
        } 
        else {
            LatexOCRPlugin?.onunload();
        }
    });
}

export function whetherStopLatexOCR() {
    if (LatexOCRPlugin) {
        LatexOCRPlugin.onunload();
    }
}

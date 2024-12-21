import * as path from "path";
import * as fs from "fs";
import { LocalModel } from "./models/local_model";
import Model, { Status, StatusBar } from "./models/model";
import { Editor } from "./obsidian_api/obsidian_api";
import { Notice, Plugin, VscodeEditor } from "./obsidian_api/vscode_impl";
import * as vscode from 'vscode';
import { getConfig, onConfigChange } from "../../config/configuration";

export interface LatexOCRSettings {
    /** Enables/disables debug logs */
    debug: boolean;

    /** Path to look for python installation */
    pythonPath: string;

    /** Path where local model is cached */
    cacheDirPath: string;

    /** String to put around Latex code, usually `$` or `$$` for math mode */
    delimiters: string;

    /** Port for latex-ocr-server */
    port: string;

    /** Start latex-ocr-server when Obsidian is loaded */
    startServerOnLoad: boolean;

    /** Toggle status bar */
    showStatusBar: boolean;

    /** Use local model or HF API */
    useLocalModel: boolean;

    /** Hugging face API key */
    hfApiKey: string | ArrayBuffer;

    /** Obfuscated key shown in settings */
    obfuscatedKey: string;
}

const DEFAULT_SETTINGS: LatexOCRSettings = {
    debug: true,
    pythonPath: 'python3',
    cacheDirPath: '',
    delimiters: '$$',
    port: '50051',
    startServerOnLoad: true,
    showStatusBar: true,
    useLocalModel: false,
    hfApiKey: "",
    obfuscatedKey: "",
};

// https://pillow.readthedocs.io/en/stable/handbook/image-file-formats.html
export const IMG_EXTS = ["png", "jpg", "jpeg", "bmp", "dib", "eps", "gif", "ppm", "pbm", "pgm", "pnm", "webp"];

export default class LatexOCR extends Plugin{
    settings: LatexOCRSettings = DEFAULT_SETTINGS;
    vaultPath: string = "";
    pluginPath: string = "";
    statusBar?: StatusBar;
    model?: Model;

    async onload() {
        await this.loadSettings();
        const workspaceFolder = (vscode.workspace.workspaceFolders ?? []).filter(folder => folder.uri.scheme === 'file');
        if (workspaceFolder.length !== 0) {
            this.vaultPath = workspaceFolder[0].uri.path;
        }
        this.pluginPath = this.context.extensionPath;
        if (this.settings.cacheDirPath === "") {
            this.settings.cacheDirPath = path.resolve(this.pluginPath, "model_cache");
        }
        if (!this.settings.pythonPath || this.settings.pythonPath === "python3") {            
            this.settings.pythonPath = path.resolve(this.pluginPath, "server/latex-pix-server.exe");
        }
        vscode.window.showInformationMessage("Loading Model from " + this.settings.cacheDirPath);
        vscode.window.showInformationMessage("Loading Server from " + this.settings.pythonPath);

        this.model = new LocalModel(this.settings);

        this.model.load();

        // try {
		// 	await fs.promises.mkdir(path.join(this.pluginPath, "/.clipboard_images/"));
		// } catch (err:any) {
		// 	// if (!(err.message as string).includes("EEXIST")) { console.error(err) }
        //     console.log(err);
        // }

        const command = vscode.commands.registerCommand("latex-pix.paste-latex-from-path", (path:string) => {
            
            const textEditor = vscode.window.activeTextEditor;
            if (textEditor) {
                const editor = new VscodeEditor(textEditor);
                this.pathToText(editor,path).catch((err) => {
                    new Notice(`❌ ${err.message}`);
                    console.error(err.name, err.message);
                });
            }
        });
        this.context.subscriptions.push(command);

        this.statusBar = new StatusBar(this);

    }

	onunload() {
        this.model?.unload();
        this.statusBar?.stop();
    }
    
    onshow() {
        this.model?.load();
        this.statusBar?.show();
    }

    async loadSettings() {
        type LatexOCRSettingsPart = {
            delimiters: string;
            pythonPath: string;
            cacheDirPath: string;
            port: string;
        };
        let configuration = getConfig<LatexOCRSettingsPart>("ocr");
		this.settings = Object.assign({}, DEFAULT_SETTINGS, configuration);
    }

    async saveSettings() {
		if (this.model) {
            this.model.reloadSettings(this.settings);
		}
    }


    // Get a clipboard file, save it to disk temporarily,
    // call the LatexOCR client.
    async pathToText(editor: Editor, imgpath: string) {
        
        // Abort if model isn't ready
        const status = await this.model?.status() ?? {status:Status.Unreachable,msg:"The model has not load"};
        if (status.status !== Status.Ready) {
            throw new Error(status.msg);
        }

        // Write generating message
        const from = editor.getCursor("from");
        this.debug(`latex_ocr: recieved paste command at line ${from.line}`);
        const waitMessage = `\\LaTeX \\text{ is being generated... } \\vphantom{${from.line}}`;
        const fullMessage = `${this.settings.delimiters}${waitMessage}${this.settings.delimiters}`;

        editor.replaceSelection(fullMessage);

        let latex: string;
        try {
            // Get latex
            latex = (await this.model?.imgfileToLatex(imgpath)) ?? "";
        } catch (err) {
            // If err, return empty string so that we erase `fullMessage`
            latex = "";
            new Notice(`⚠️ ${err} `, 5000);
            console.error(err);
        }
        // Find generating message again.
        // Starts search from original line, then downwards to the end of the document,
        // Then upwards to the start of the document.
        const firstLine = 0;
        const lastLine = editor.lineCount() - 1;
        let currLine = from.line;

        while (currLine <= lastLine) {
            const text = editor.getLine(currLine);
            const from = text.indexOf(fullMessage);
            if (from !== -1) {
                editor.replaceRange(latex, { line: currLine, ch: from }, { line: currLine, ch: from + fullMessage.length });
                if (latex !== "") {
                    new Notice(`🪄 Latex pasted to note`);
                }
                return;
            }
            currLine += 1;
        }

        currLine = from.line - 1;
        while (currLine >= firstLine) {
            const text = editor.getLine(currLine);
            const from = text.indexOf(fullMessage);
            if (from !== -1) {
                editor.replaceRange(latex, { line: currLine, ch: from }, { line: currLine, ch: from + fullMessage.length });
                if (latex !== "") {
                    new Notice(`🪄 Latex pasted to note`);
                }
                return;
            }
            currLine -= 1;
        }
    }

    async clipboardToText(editor: Editor) {
        // // Get clipboard file
        
        // const file = await vscode.env.clipboard.readText();
        // if (file.length === 0) {
        //     throw new Error("Couldn't find image in clipboard");
        // }

        // let filetype = null;
        // for (const ext of IMG_EXTS) {
        //     if (file[0].types.includes(`image/${ext}`)) {
        //         this.debug(`latex_ocr: found image in clipboard with mimetype image/${ext}`);
        //         filetype = ext;
        //         break;
        //     }
        // }

        // if (filetype === null) {
        //     throw new Error("Couldn't find image in clipboard");
        // }



        // // Save image to file
        // if(file )
        // const blob = await file[0].getType(`image/${filetype}`);
        // const buffer = Buffer.from(await blob.arrayBuffer());
        // const imgpath = path.join(this.pluginPath, `/.clipboard_images/pasted_image.${filetype}`);
        // fs.writeFileSync(imgpath, buffer);

        // await this.pathToText(editor,imgpath);


        // // If the message isn't found, abort
        // throw new Error("Couldn't find paste target");
    }

    debug(message?: any, error: boolean = false) {
        if (this.settings.debug) {
            if (error) {
                console.error(message);
            } else {
                console.log(message);
            }
        }
    }
}
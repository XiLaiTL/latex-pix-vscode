import { PathLike } from "fs";
import LatexOCR, { LatexOCRSettings } from "../main";
import { sleep, StatusBarItem } from "../obsidian_api/vscode_impl";
import * as vscode from 'vscode';

export enum Status {
    Ready,
    Loading,
    Downloading,
    Unreachable,
    Misconfigured
}

export class StatusBar {
    span: StatusBarItem;
    plugin: LatexOCR;
    private stopped: boolean = true;

    constructor(plugin: LatexOCR) {
        this.plugin = plugin;
        this.span = plugin.addStatusBarItem("latex-pix.stop-server");
        this.span.createEl("span", { text: "LatexOCR ❌" });
        this.updateStatusBar();
        if (!plugin.settings.showStatusBar) {
            this.hide();
        }
        else {
            this.show();
            // this.stopped = false;
            // this.startStatusBar();
        }
    }

    // Update the status bar based on the connection to the LatexOCR server
    // ✅: LatexOCR is up and accepting requests
    // 🌐: LatexOCR is downloading the model from huggingface
    // ⚙️: LatexOCR is loading the model
    // ❌: LatexOCR isn't reachable
    async updateStatusBar(): Promise<boolean> {
        const status = await this.plugin.model?.status() ?? {status:Status.Unreachable,msg:"The model has not load"};
        this.plugin.debug(`latex_ocr: sent status check to ${this.plugin.model?.constructor.name}, got ${JSON.stringify(status)}`);

        switch (status.status) {
            case Status.Ready:
                this.span.setText("LatexOCR ✅");
                return true;

            case Status.Downloading:
                this.span.setText("LatexOCR 🌐");
                break;

            case Status.Loading:
                this.span.setText("LatexOCR ⚙️");
                break;

            case Status.Misconfigured:
                this.span.setText("LatexOCR 🔧");
                break;

            case Status.Unreachable:
                this.span.setText("LatexOCR ❌");
                break;

            default:
                this.plugin.debug(status, true);
                break;
        }
        return false;
    }

    // Call `updateStatusBar` with an initial delay of `number`.
    // After this, `updateStatusBar` based on invterval values
    // Should only be called once.
    private async startStatusBar() {
        while (!this.stopped) {
            const ready = await this.updateStatusBar();
            if (ready) {
                await sleep(this.plugin.model?.statusCheckIntervalReady??5000);
            } else {
                await sleep(this.plugin.model?.statusCheckIntervalLoading??5000);
            }
        }
    }


    hide() {
        this.span.hide();
    }

    show() {
        this.span.show();
        if (this.stopped) {
            this.stopped = false;
            this.startStatusBar();
        }
    }

    stop() {
        this.stopped = true;
    }
}

export default interface Model {
    // Interval (ms) of statusCheck message when previous message was unsuccessful
    statusCheckIntervalLoading: number;
    // Interval (ms) of statusCheck message when previous message was successful
    statusCheckIntervalReady: number;

    load: () => void;
    unload: () => void;

    imgfileToLatex: (filepath: PathLike) => Promise<string>

    status: () => Promise<{ status: Status, msg: string }>;

    reloadSettings: (settings: LatexOCRSettings) => void;
}
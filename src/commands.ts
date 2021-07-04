import * as vscode from "vscode";
import Pass from "./services/pass";

export default class Commands {
  private pass = new Pass();

  constructor(private _context: vscode.ExtensionContext) {}

  async listPasswords() {
    const { files } = (await this.pass.list()).data;
    Object.entries(files).forEach(
      ([listName, fileList]: [string, string[]]) => {
        vscode.window.showInformationMessage(fileList.join(" - "));
      }
    );
  }
}

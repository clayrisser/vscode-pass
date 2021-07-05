import * as vscode from "vscode";
import Pass from "./services/pass";

export default class Commands {
  private pass = new Pass();

  constructor(private _context: vscode.ExtensionContext) {}

  async listPasswords() {
    const { files } = (await this.pass.list()).data;
    Object.entries(files).forEach(
      async ([listName, fileList]: [string, string[]]) => {
        if (!fileList.length) {
          return;
        }
        const content = fileList.join("\n");
        await this._openFile(`${listName}.list`, content);
      }
    );
  }

  async fetchPassword() {
    let password = await vscode.window.showInputBox({
      placeHolder: "password file?",
    });
    if (!password) {
      return;
    }
    if (password.substr(password.length - 4) !== ".gpg") {
      password = `${password}.gpg`;
    }
    const content = (await this.pass.fetch(password))?.data?.contents;
    if (!content) {
      return;
    }
    await this._openFile(password, content);
  }

  private async _openFile(filename: string, content: string) {
    const uri = vscode.Uri.parse(
      `pass:${filename}?content=${Buffer.from(content).toString("base64")}`
    );
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc, { preview: false });
  }
}

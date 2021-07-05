import * as vscode from "vscode";
import Pass from "./services/pass";

export default class Commands {
  private pass = new Pass();

  constructor(private _context: vscode.ExtensionContext) {}

  async listPasswords() {
    const { files } = (await this.pass.list()).data;
    Object.entries(files).forEach(
      async ([listName, fileList]: [string, string[]]) => {
        const content = fileList.join("\n");
        const uri = vscode.Uri.parse(
          `pass:${listName}.list?content=${Buffer.from(content).toString(
            "base64"
          )}`
        );
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc, { preview: false });
      }
    );
  }
}

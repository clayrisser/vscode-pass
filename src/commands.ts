import * as vscode from "vscode";
import * as os from "os";
import * as path from "path";
import { Pass, HashMap } from "pass-client";

const passwordStorePath = path.resolve(os.homedir(), ".password-store");

export default class Commands {
  private pass = new Pass({ passwordStorePath });

  constructor(private _context: vscode.ExtensionContext) {}

  async listPasswords() {
    const { files } = await this.pass.list();
    Object.entries(files as HashMap<string[]>).forEach(
      async ([listName, fileList]: [string, string[]]) => {
        if (!fileList.length) {
          return;
        }
        const content = fileList.join("\n");
        await this._openFile(`${listName}.list`, content);
      }
    );
  }

  async showPassword() {
    let password = (
      (await vscode.window.showQuickPick(
        (
          await this.pass.list()
        ).files.default.map((password: string) => ({
          detail: path
            .resolve(passwordStorePath, password)
            .replace(os.homedir(), "~"),
          label: password.replace(/.gpg$/g, ""),
          value: password,
        })),
        {
          placeHolder: "Choose a password from the list.",
        }
      )) as unknown as { detail: string; label: string; value: string }
    ).value;
    if (!password) {
      return;
    }
    if (password.substr(password.length - 4) !== ".gpg") {
      password = `${password}.gpg`;
    }
    const content = (await this.pass.show(password))?.contents;
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

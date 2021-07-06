import * as qs from "qs";
import * as vscode from "vscode";

export default class PassDocumentContentProvider
  implements vscode.TextDocumentContentProvider
{
  constructor(private readonly _context: vscode.ExtensionContext) {}

  static register(context: vscode.ExtensionContext) {
    return vscode.workspace.registerTextDocumentContentProvider(
      "pass",
      new PassDocumentContentProvider(context)
    );
  }

  provideTextDocumentContent(uri: vscode.Uri): string {
    return `${Buffer.from(
      qs.parse(uri.query)?.content?.toString() || "",
      "base64"
    ).toString()}
`;
  }

  static async openFile(filename: string, content: string) {
    const uri = vscode.Uri.parse(
      `pass:${filename}?content=${Buffer.from(content).toString("base64")}`
    );
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc, { preview: false });
  }
}

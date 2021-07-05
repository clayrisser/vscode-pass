import * as vscode from "vscode";
import * as qs from "qs";
import Pass from "./services/pass";

export default class PassDocument
  implements vscode.TextDocumentContentProvider
{
  private pass = new Pass();

  provideTextDocumentContent(uri: vscode.Uri): string {
    return `${Buffer.from(
      qs.parse(uri.query)?.content?.toString() || "",
      "base64"
    ).toString()}
`;
  }
}

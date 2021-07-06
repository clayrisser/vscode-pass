import * as vscode from "vscode";
import * as os from "os";
import * as path from "path";
import { Pass } from "pass-client";
import { Disposable } from "./dispose";

export default class PassDocument
  extends Disposable
  implements vscode.CustomDocument
{
  private readonly _uri: vscode.Uri;

  private _content: string;

  private readonly _delegate: PassDocumentDelegate;

  private _edits: PassEdit[] = [];

  private _savedEdits: PassEdit[] = [];

  private constructor(
    uri: vscode.Uri,
    content: string,
    delegate: PassDocumentDelegate
  ) {
    super();
    this._uri = uri;
    this._content = content;
    this._delegate = delegate;
  }

  static async create(
    uri: vscode.Uri,
    backupId: string | undefined,
    delegate: PassDocumentDelegate
  ): Promise<PassDocument | PromiseLike<PassDocument>> {
    const dataFile =
      typeof backupId === "string" ? vscode.Uri.parse(backupId) : uri;
    const content = await PassDocument.readFile(dataFile);
    return new PassDocument(uri, content, delegate);
  }

  private static async readFile(uri: vscode.Uri): Promise<string> {
    if (uri.scheme === "untitled") {
      return "";
    }
    const passwordStorePath = path.resolve(os.homedir(), ".password-store");
    const pass = new Pass({ passwordStorePath });
    return (await pass.show(uri.fsPath.replace(passwordStorePath, "")))
      ?.contents;
  }

  public get uri() {
    return this._uri;
  }

  public get content() {
    return this._content;
  }

  async save(cancellation: vscode.CancellationToken): Promise<void> {
    await this.saveAs(this.uri, cancellation);
    this._savedEdits = Array.from(this._edits);
  }

  async saveAs(
    targetResource: vscode.Uri,
    cancellation: vscode.CancellationToken
  ): Promise<void> {
    const content = await this._delegate.getContent();
    const passwordStorePath = path.resolve(os.homedir(), ".password-store");
    if (cancellation.isCancellationRequested) {
      return;
    }
    const pass = new Pass({ passwordStorePath });
    await pass.insert(
      targetResource.fsPath.replace(passwordStorePath, ""),
      content
    );
  }

  async revert(_cancellation: vscode.CancellationToken): Promise<void> {
    const content = await PassDocument.readFile(this.uri);
    this._content = content;
    this._edits = this._savedEdits;
    this._onDidChangeDocument.fire({
      content,
      edits: this._edits,
    });
  }

  async backup(
    destination: vscode.Uri,
    cancellation: vscode.CancellationToken
  ): Promise<vscode.CustomDocumentBackup> {
    await this.saveAs(destination, cancellation);
    return {
      id: destination.toString(),
      delete: async () => {
        try {
          await vscode.workspace.fs.delete(destination);
        } catch {
          // noop
        }
      },
    };
  }

  makeEdit(edit: PassEdit) {
    this._edits.push(edit);
    this._onDidChange.fire({
      label: "Edit",
      undo: async () => {
        this._edits.pop();
        this._onDidChangeDocument.fire({
          edits: this._edits,
        });
      },
      redo: async () => {
        this._edits.push(edit);
        this._onDidChangeDocument.fire({
          edits: this._edits,
        });
      },
    });
  }

  dispose(): void {
    this._onDidDispose.fire();
    super.dispose();
  }

  private readonly _onDidDispose = this._register(
    new vscode.EventEmitter<void>()
  );
  public readonly onDidDispose = this._onDidDispose.event;

  private readonly _onDidChangeDocument = this._register(
    new vscode.EventEmitter<PassEdit>()
  );
  public readonly onDidChangeContent = this._onDidChangeDocument.event;

  private readonly _onDidChange = this._register(
    new vscode.EventEmitter<{
      readonly label: string;
      undo(): void;
      redo(): void;
    }>()
  );
  public readonly onDidChange = this._onDidChange.event;
}

export interface PassEdit {}

interface PassDocumentDelegate {
  getContent(): Promise<string>;
}

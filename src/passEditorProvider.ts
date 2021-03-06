/**
 * File: /src/passEditorProvider.ts
 * Project: pass
 * File Created: 06-07-2021 15:27:46
 * Author: Clay Risser <email@clayrisser.com>
 * -----
 * Last Modified: 08-07-2021 03:53:26
 * Modified By: Clay Risser <email@clayrisser.com>
 * -----
 * Silicon Hills LLC (c) Copyright 2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import vscode from 'vscode';
import PassDocument, { PassEdit } from './passDocument';
import WebviewCollection from './webviewCollection';
import { disposeAll } from './dispose';
import { getNonce } from './util';
import { HashMap } from './types';

export default class PassEditorProvider
  implements vscode.CustomEditorProvider<PassDocument>
{
  private readonly webviews = new WebviewCollection();

  constructor(private readonly context: vscode.ExtensionContext) {}

  static readonly viewType = 'passEdit.gpg';

  private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<
    vscode.CustomDocumentEditEvent<PassDocument>
  >();

  private _requestId = 1;

  private readonly _callbacks = new Map<number, (response: any) => void>();

  public readonly onDidChangeCustomDocument =
    this._onDidChangeCustomDocument.event;

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    return vscode.window.registerCustomEditorProvider(
      PassEditorProvider.viewType,
      new PassEditorProvider(context),
      {
        webviewOptions: {
          retainContextWhenHidden: false
        },
        supportsMultipleEditorsPerDocument: false
      }
    );
  }

  public saveCustomDocument(
    document: PassDocument,
    cancellation: vscode.CancellationToken
  ): Thenable<void> {
    return document.save(cancellation);
  }

  public saveCustomDocumentAs(
    document: PassDocument,
    destination: vscode.Uri,
    cancellation: vscode.CancellationToken
  ): Thenable<void> {
    return document.saveAs(destination, cancellation);
  }

  public revertCustomDocument(
    document: PassDocument,
    cancellation: vscode.CancellationToken
  ): Thenable<void> {
    return document.revert(cancellation);
  }

  public backupCustomDocument(
    document: PassDocument,
    context: vscode.CustomDocumentBackupContext,
    cancellation: vscode.CancellationToken
  ): Thenable<vscode.CustomDocumentBackup> {
    return document.backup(context.destination, cancellation);
  }

  async resolveCustomEditor(
    document: PassDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    this.webviews.add(document.uri, webviewPanel);
    webviewPanel.webview.options = {
      enableScripts: true
    };
    webviewPanel.webview.html = await this.getHtmlForWebview(
      webviewPanel.webview,
      document.content,
      { uri: document.uri.toString() }
    );
    webviewPanel.webview.onDidReceiveMessage((e) =>
      this.onMessage(document, e)
    );
    webviewPanel.webview.onDidReceiveMessage((e) => {
      if (e.type === 'ready') {
        if (document.uri.scheme === 'untitled') {
          this.postMessage(webviewPanel, 'init', {
            untitled: true,
            editable: true
          });
        } else {
          const editable = vscode.workspace.fs.isWritableFileSystem(
            document.uri.scheme
          );
          this.postMessage(webviewPanel, 'init', {
            value: document.content,
            editable
          });
        }
      }
    });
  }

  async openCustomDocument(
    uri: vscode.Uri,
    openContext: { backupId?: string },
    _token: vscode.CancellationToken
  ): Promise<PassDocument> {
    const document: PassDocument = await PassDocument.create(
      uri,
      openContext.backupId,
      {
        getContent: async (): Promise<string> => {
          const webviewsForDocument = Array.from(
            this.webviews.get(document.uri)
          );
          if (!webviewsForDocument.length) {
            throw new Error('Could not find webview to save for');
          }
          const panel = webviewsForDocument[0];
          return this.postMessageWithResponse<string>(panel, 'getContent', {});
        }
      }
    );
    const listeners: vscode.Disposable[] = [];
    listeners.push(
      document.onDidChange((e: any) => {
        this._onDidChangeCustomDocument.fire({
          document,
          ...e
        });
      })
    );
    listeners.push(
      document.onDidChangeContent((e: any) => {
        Array.from(this.webviews.get(document.uri)).forEach(
          (webviewPanel: vscode.WebviewPanel) => {
            this.postMessage(webviewPanel, 'update', {
              edits: e.edits,
              content: e.content
            });
          }
        );
      })
    );
    document.onDidDispose(() => disposeAll(listeners));
    return document;
  }

  private async getHtmlForWebview(
    webview: vscode.Webview,
    content: string,
    data: HashMap<any> = {}
  ): Promise<string> {
    const scriptPassUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'public/passWebview.js')
    );
    const stylePassUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'media/pass.css')
    );
    data.content = content;
    const nonce = getNonce();
    return /* html */ `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${
          webview.cspSource
        } blob:; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${stylePassUri}" rel="stylesheet" />
				<title>Paw Draw</title>
			</head>
			<body>
        <body id="pass" />
        <script nonce="${nonce}">
          window.__passData=${JSON.stringify(data)}
        </script>
				<script nonce="${nonce}" src="${scriptPassUri}"></script>
			</body>
			</html>`;
  }

  private postMessageWithResponse<R = unknown>(
    panel: vscode.WebviewPanel,
    type: string,
    body: any
  ): Promise<R> {
    const requestId = this._requestId++;
    const p = new Promise<R>((resolve) =>
      this._callbacks.set(requestId, resolve)
    );
    panel.webview.postMessage({ type, requestId, body });
    return p;
  }

  private postMessage(
    panel: vscode.WebviewPanel,
    type: string,
    body: any
  ): void {
    panel.webview.postMessage({ type, body });
  }

  private onMessage(document: PassDocument, message: any) {
    switch (message.type) {
      case 'stroke':
        document.makeEdit(message as PassEdit);
        return;
      case 'response': {
        const callback = this._callbacks.get(message.requestId);
        callback?.(message.body);
      }
    }
  }
}

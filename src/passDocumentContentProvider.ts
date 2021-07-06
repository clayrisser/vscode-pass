/*
 * File: /src/passDocumentContentProvider.ts
 * Project: vscode-pass
 * File Created: 06-07-2021 15:27:46
 * Author: Clay Risser <email@clayrisser.com>
 * -----
 * Last Modified: 06-07-2021 16:41:02
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

import qs from 'qs';
import vscode from 'vscode';

export default class PassDocumentContentProvider
  implements vscode.TextDocumentContentProvider
{
  constructor(private readonly _context: vscode.ExtensionContext) {}

  static register(context: vscode.ExtensionContext) {
    return vscode.workspace.registerTextDocumentContentProvider(
      'pass',
      new PassDocumentContentProvider(context)
    );
  }

  provideTextDocumentContent(uri: vscode.Uri): string {
    return `${Buffer.from(
      qs.parse(uri.query)?.content?.toString() || '',
      'base64'
    ).toString()}
`;
  }

  static async openFile(filename: string, content: string) {
    const uri = vscode.Uri.parse(
      `pass:${filename}?content=${Buffer.from(content).toString('base64')}`
    );
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc, { preview: false });
  }
}

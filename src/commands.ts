/*
 * File: /src/commands.ts
 * Project: vscode-pass
 * File Created: 06-07-2021 15:27:46
 * Author: Clay Risser <email@clayrisser.com>
 * -----
 * Last Modified: 06-07-2021 16:44:07
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
import os from 'os';
import path from 'path';
import { Pass, HashMap } from 'pass-client';
import PassDocumentContentProvider from './passDocumentContentProvider';
import PassEditorProvider from './passEditorProvider';

const passwordStorePath = path.resolve(os.homedir(), '.password-store');

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
        const content = fileList.join('\n');
        await PassDocumentContentProvider.openFile(`${listName}.list`, content);
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
            .replace(os.homedir(), '~'),
          label: password.replace(/.gpg$/g, ''),
          value: password
        })),
        {
          placeHolder: 'Choose a password from the list.'
        }
      )) as unknown as { detail: string; label: string; value: string }
    ).value;
    if (!password) {
      return;
    }
    if (password.substr(password.length - 4) !== '.gpg') {
      password = `${password}.gpg`;
    }
    const content = (await this.pass.show(password))?.contents;
    if (!content) {
      return;
    }
    const uri = vscode.Uri.parse(path.resolve(passwordStorePath, password));
    vscode.commands.executeCommand(
      'vscode.openWith',
      uri,
      PassEditorProvider.viewType
    );
  }
}

/*
 * File: /src/extension.ts
 * Project: vscode-pass
 * File Created: 06-07-2021 15:27:46
 * Author: Clay Risser <email@clayrisser.com>
 * -----
 * Last Modified: 06-07-2021 16:44:59
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
import Commands from './commands';
import PassDocumentContentProvider from './passDocumentContentProvider';
import PassEditorProvider from './passEditorProvider';
import pkg from './pkg';

const logger = console;

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(PassDocumentContentProvider.register(context));
  context.subscriptions.push(PassEditorProvider.register(context));

  const commands = new Commands(context);
  Object.getOwnPropertyNames(Object.getPrototypeOf(commands)).forEach(
    (commandName: string) => {
      if (
        commandName.length &&
        commandName[0] !== '_' &&
        commandName[0].toLowerCase() === commandName[0] &&
        // @ts-ignore
        typeof commands[commandName] === 'function'
      ) {
        const command = (...args: any[]) => {
          // @ts-ignore
          return commands[commandName](...args).catch(logger.error);
        };
        context.subscriptions.push(
          vscode.commands.registerCommand(`${pkg.name}.${commandName}`, command)
        );
      }
    }
  );
}

export function deactivate() {
  return null;
}

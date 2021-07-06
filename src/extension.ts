import * as vscode from "vscode";
import Commands from "./commands";
import PassDocumentContentProvider from "./passDocumentContentProvider";
import PassEditorProvider from "./passEditorProvider";
import pkg from "./pkg";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(PassDocumentContentProvider.register(context));
  context.subscriptions.push(PassEditorProvider.register(context));

  const commands = new Commands(context);
  Object.getOwnPropertyNames(Object.getPrototypeOf(commands)).forEach(
    (commandName: string) => {
      if (
        commandName.length &&
        commandName[0] !== "_" &&
        commandName[0].toLowerCase() === commandName[0] &&
        // @ts-ignore
        typeof commands[commandName] === "function"
      ) {
        const command = (...args: any[]) => {
          // @ts-ignore
          return commands[commandName](...args).catch(console.error);
        };
        context.subscriptions.push(
          vscode.commands.registerCommand(`${pkg.name}.${commandName}`, command)
        );
      }
    }
  );
}

export function deactivate() {}

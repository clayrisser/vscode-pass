import * as vscode from "vscode";
import Pass from "./services/pass";
import Commands from "./commands";
import pkg from "./pkg";

const pass = new Pass();

export function activate(context: vscode.ExtensionContext) {
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
        // @ts-ignore
        const command = (...args: any[]) => commands[commandName](...args);
        context.subscriptions.push(
          vscode.commands.registerCommand(`${pkg.name}.${commandName}`, command)
        );
      }
    }
  );
}

export function deactivate() {}

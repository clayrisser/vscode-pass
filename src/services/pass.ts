import * as which from "which";
import { Action, HashMap, Response } from "../types";
import Message from "./message";

export default class Pass {
  private message = new Message();

  private _gpgPath = "";

  async list(): Promise<Response<ListData>> {
    return this.message.request({
      action: Action.list,
      echoResponse: "",
      file: "",
      storeId: "default",
      settings: {
        gpgPath: "~/.gnupg",
        stores: {
          default: {
            id: "default",
            name: "default",
            path: "~/.password-store",
            settings: {
              gpgPath: "~/.gnupg",
            },
          },
        },
      },
    });
  }

  async fetch(file: string): Promise<Response<FetchData>> {
    return this.message.request({
      action: Action.fetch,
      echoResponse: "",
      file: file,
      storeId: "default",
      settings: {
        gpgPath: await this.getGpgPath(),
        stores: {
          default: {
            id: "default",
            name: "default",
            path: "~/.password-store",
            settings: {
              gpgPath: await this.getGpgPath(),
            },
          },
        },
      },
    });
  }

  private async getGpgPath() {
    if (this._gpgPath.length) {
      return this._gpgPath;
    }
    this._gpgPath = await which("gpg");
    return this._gpgPath;
  }
}

export interface ListData {
  files: HashMap<string[]>;
}

export interface FetchData {
  contents: string;
}

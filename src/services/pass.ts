import { Action, HashMap, Response } from "../types";
import Message from "./message";

export default class Pass {
  private message = new Message();

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
}

export interface ListData {
  files: HashMap<string[]>;
}

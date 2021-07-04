import * as execa from "execa";
import { Request } from "../types";

export default class Message {
  async request(request: Request): Promise<any> {
    const buffer = this.contentToBytes(JSON.stringify(request));
    const result = JSON.parse(
      Buffer.from(
        (
          await execa("browserpass", [], {
            input: buffer,
          })
        ).stdout
      )
        .subarray(6)
        .toString()
    );
    return result;
  }

  private contentToBytes(content: string): Buffer {
    return Buffer.concat([
      this.lengthToBytes(content.length),
      Buffer.from(content),
    ]);
  }

  private lengthToBytes(length: number) {
    let buffer = Buffer.alloc(4);
    let hex = "";
    Array.from(length.toString(16).padStart(8, "0")).forEach(
      (hexChar: string, i: number) => {
        if (i % 2 === 0) {
          hex = hexChar;
        } else {
          hex += hexChar;
          buffer[(i + 1) / 2 - 1] = parseInt(hex, 16);
          hex = "";
        }
      }
    );
    return buffer.reverse();
  }
}

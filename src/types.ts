/*
 * File: /src/types.ts
 * Project: vscode-pass
 * File Created: 06-07-2021 15:27:46
 * Author: Clay Risser <email@clayrisser.com>
 * -----
 * Last Modified: 06-07-2021 15:28:13
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

export interface HashMap<T = any> {
  [key: string]: T;
}

export type DeepHashMap<T = any> = HashMap<T | DeepHashMap<T>>;

export interface StoreSettings {
  gpgPath: string;
}

export interface Store {
  id: string;
  name: string;
  path: string;
  settings: StoreSettings;
}

export interface Settings {
  gpgPath: string;
  stores: HashMap<Store>;
}

export interface Request {
  action: Action;
  echoResponse: any;
  file: string;
  settings: Settings;
  storeId: string;
}

export interface Response<D = DeepHashMap<any>> {
  status: Status;
  version: number;
  data: D;
  code?: any;
  params?: any;
}

export interface ConfigureResponse {
  defaultStore: Store;
  storeSettings: HashMap<string>;
}

export enum Action {
  configure = 'configure',
  echo = 'echo',
  fetch = 'fetch',
  list = 'list'
}

export enum Status {
  ok = 'ok'
}

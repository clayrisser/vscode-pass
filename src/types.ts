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
  configure = "configure",
  echo = "echo",
  fetch = "fetch",
  list = "list",
}

export enum Status {
  ok = "ok",
}

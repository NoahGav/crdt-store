import * as Y from 'yjs';

export type StoreType = object | Array<any> | "text" | "xml";
export type StoreShape = Record<string, StoreType>;

export type StoreCheckout<TShape extends StoreShape> = {
  [K in keyof TShape]:
    TShape[K] extends 'text' ? StoreText :
    TShape[K] extends 'xml' ? StoreXml :
    TShape[K]
};

export class Store {
  static checkout<TShape extends StoreShape>(shape: TShape): StoreCheckout<TShape> {
    const doc = new Y.Doc();

    // TODO - Validate shape and create an efficient proxy.

    throw new Error('Not implemented');
  }
}

export class StoreText {

}

export class StoreXml {

}
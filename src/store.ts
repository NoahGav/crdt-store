import * as Y from 'yjs';

type StoreType = object | Array<any> | "text" | "xml";
type StoreShape = Record<string | symbol, StoreType>;

type StoreState<TShape extends StoreShape> = {
  [K in keyof TShape]:
    TShape[K] extends 'text' ? StoreText :
    TShape[K] extends 'xml' ? StoreXml :
    TShape[K]
};

export class Store {
  private static docSymbol = Symbol();

  /** TODO */
  public static checkout<TShape extends StoreShape>(shape: TShape): StoreState<TShape> {
    // Initialize the store's doc.
    const doc = new Y.Doc();

    // Process the store's shape.
    const values = this.process(doc, shape);

    // Create the store's proxy.
    const store = new Proxy({} as StoreState<TShape>, {
      get(target, key) {
        if (key === Store.docSymbol) return doc;
        if (typeof key !== 'string') throw new Error('TODO');
        if (values[key]) return values[key];
        throw new Error('TODO');
      },

      ownKeys() {
        return Array.from(doc.share.keys());
      }
    });

    return store;
  }

  /** Applies the update to the store's state. */
  public static apply(store: StoreShape, update: Uint8Array) {
    Y.applyUpdate(store[Store.docSymbol] as Y.Doc, update);
  }

  /** Encodes the store's state as an update that can be sent to others. */
  public static encode(store: StoreShape) {
    return Y.encodeStateAsUpdate(store[Store.docSymbol] as Y.Doc);
  }

  /** Makes sure the given shape is valid and returns their values. */
  private static process(doc: Y.Doc, shape: StoreShape) {
    const values = {} as Record<string, any>;

    for (const [key, value] of Object.entries(shape)) {
      if (Array.isArray(value)) {
        if (value.length) throw new Error(`Array '${key}' in shape must be empty`);
        // TODO - Create the array object and add it to values.
      } else if (typeof value === 'object') {
        throw new Error('Not implemented');
      } else if (value === 'text') {
        values[key] = new StoreText(doc, key);
      } else if (value === 'xml') {
        values[key] = new StoreXml(doc, key);
      } else {
        throw new Error(`Invalid shape type '${typeof value}' in key '${key}'`);
      }
    }

    return values;
  }
}

export class StoreText {
  private text: Y.Text;

  constructor(doc: Y.Doc, key: string) {
    this.text = doc.getText(key);
  }
}

export class StoreXml {
  private xml: Y.XmlFragment;

  constructor(doc: Y.Doc, key: string) {
    this.xml = doc.getXmlFragment(key);
  }
}
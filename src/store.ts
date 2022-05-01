import { Text } from './text';
import { Xml } from './xml';
import * as Y from 'yjs';

type ShapeType = object | Array<any> | 'text' | 'xml';
type Shape = Record<string, ShapeType>;
type State = Record<string, any>;

/** TODO */
export class Store<TState extends State> {
  private constructor(state: TState) {
    this.doc = new Y.Doc();
    this.state = state;
  }

  /** TODO */
  public static open<TShape extends Shape>(shape: TShape): Store<{
    [K in keyof TShape]:
      TShape[K] extends 'text' ? Text :
      TShape[K] extends 'xml' ? Xml :
      TShape[K]
  }> {
    // TODO - Create the state proxy.
    return new Store({} as any);
  }

  /** The underlying yjs document. */
  public readonly doc: Y.Doc;

  /** The store's state. */
  public readonly state: TState;
  
  /** Syncs your store's state with the state of the user who sent you the incremental update. */
  public apply(update: Uint8Array) {
    Y.applyUpdate(this.doc, update);
  }

  /**
   * Encodes an incremental update from your state relative to another user's state vector.
   * You can send this value back to the user who sent you their state vector so they can sync
   * with your store's state.
   */
  public encode(vector: Uint8Array) {
    return Y.encodeStateAsUpdate(this.doc, vector);
  }

  /**
   * Returns the store's state vector used for incremental updates.
   * You can send this value to another user so they can encode only the
   * updates that you do not have.
   */
  public vector() {
    return Y.encodeStateVector(this.doc);
  }
}

// import * as Y from 'yjs';
// import { StoreArray } from './array';

// type StoreType = object | Array<any> | "text" | "xml";
// type StoreShape = Record<string | symbol, StoreType>;

// type StoreState<TShape extends StoreShape> = {
//   [K in keyof TShape]:
//     TShape[K] extends 'text' ? Y.Text :
//     TShape[K] extends 'xml' ? Y.XmlFragment :
//     TShape[K];
// };

// export class Store {
//   private static docSymbol = Symbol();

//   /** TODO */
//   public static open<TShape extends StoreShape>(shape: TShape): StoreState<TShape> {
//     // Initialize the store's doc.
//     const doc = new Y.Doc();

//     // Process the store's shape.
//     const values = this.process(doc, shape);

//     // Create the store's proxy.
//     const store = new Proxy({} as StoreState<TShape>, {
//       get(target, key) {
//         if (key === Store.docSymbol) return doc;
//         if (typeof key !== 'string') throw new Error('TODO');
//         if (!values[key]) throw new Error('TODO');
        
//         return values[key];
//       },

//       ownKeys() {
//         return Array.from(doc.share.keys());
//       }
//     });

//     return store;
//   }

//   public static share(store: StoreState<any>) {
//     // TODO - This function will be in charge of setting up the providers.
//     //        Like webrtc, websocket, indexeddb, ...
//   }

//   /** Processes the given shape to make sure it is valid and returns their values. */
//   private static process(doc: Y.Doc, shape: StoreShape) {
//     const values = {} as Record<string, any>;

//     for (const [key, value] of Object.entries(shape)) {
//       if (Array.isArray(value)) {
//         if (value.length) throw new Error(`Array '${key}' in shape must be empty`);
//         values[key] = StoreArray.create(doc, key);
//       } else if (typeof value === 'object') {
//         throw new Error('Not implemented');
//       } else if (value === 'text') {
//         values[key] = doc.getText(key);
//       } else if (value === 'xml') {
//         values[key] = doc.getXmlFragment(key);
//       } else {
//         throw new Error(`Invalid shape type '${typeof value}' in key '${key}'`);
//       }
//     }

//     return values;
//   }
// }
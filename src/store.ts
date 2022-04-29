import * as t from './types';
import * as Y from 'yjs';

// TODO - Document.
export class Store<TState, TTransactions extends t.TransactionRecord> {
  defaults: () => TState;
  transactions: Record<string, (doc: any, proxy: any, args: any[]) => void> = {};

  private constructor(defaults: () => TState) {
    this.defaults = defaults;
  }

  static open<TState>(options: t.OpenOptions<TState>): Store<TState, {}> {
    return new Store(options.defaults);
  }

  transaction<
    TName extends string,
    TTransact extends t.Transact<TState>,
    TTransaction extends t.Transaction<TState, TName, TTransact>
  >(
    name: TName,
    transact: TTransact
  ): Store<
    TState,
    TTransactions & Record<TName, TTransaction>
  > {
    this.transactions[name] = (doc, proxy, args) => Y.transact(doc, () => transact(proxy, ...args));
    return this as any;
  }

  checkout(options: t.CheckoutOptions): State<TState, TTransactions> {
    return State.init(this, options);
  }
}

export class State<TState, TTransactions extends t.TransactionRecord> {
  private _doc: Y.Doc;
  private _store: Store<any, any>;
  private _proxy: Record<string, any>;

  private constructor(doc: Y.Doc, store: Store<any, any>, proxy: Record<string, any>) {
    this._doc = doc;
    this._store = store;
    this._proxy = proxy;
  }

  static init(store: Store<any, any>, options: t.CheckoutOptions): State<any, any> {
    const doc = new Y.Doc();
    const state = doc.getMap();
    const obj = {} as Record<string, any>;

    // This returns the reactive version of the proxy depending on the library being used.
    const reactive = options.reactive ? options.reactive : (obj: any) => obj;

    // Create the store's state proxy.
    const proxy = reactive(new Proxy(obj, {
      get: (obj, key: string) => obj[key] = state.get(key),

      set: (obj, key: string, value) => {
        obj[key] = state.set(key, value);
        return true;
      }
    }));

    // TODO - Only apply defaults if this is the first time this store's state is created.
    const defaults = store.defaults();
    for (const key in defaults) obj[key] = defaults[key];

    return new State(doc, store, proxy);
  }
  
  get value(): TState {
    return this._proxy as TState;
  }

  transact<
    TTransaction extends string & keyof TTransactions
  >(
    transaction: TTransaction,
    ...args: t.TransactionArgs<TTransactions[TTransaction]>
  ) {
    this._store.transactions[transaction](this._doc, this._proxy, args);
  }

  encodeChanges() { return Y.encodeStateAsUpdate(this._doc); }
  applyChanges(changes: Uint8Array) { Y.applyUpdate(this._doc, changes); }
}
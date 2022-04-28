import * as t from './types';
import * as Y from 'yjs';

// TODO - Document and add options (especially for checkout for 'react' and 'vue' library).
export class Store<TState, TTransactions extends t.TransactionRecord> {
  private defaults: () => TState;
  private transactions: Record<string, (doc: any, proxy: any, args: any[]) => void> = {};

  constructor(defaults: () => TState) {
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

  checkout(options: t.CheckoutOptions): TState & t.Transactions<TTransactions> {
    const doc = new Y.Doc();
    const state = doc.getMap();
    const obj = {} as Record<string, any>;

    // Create the store's state proxy.
    const proxy = new Proxy(obj, {
      get: (obj, key: string) => {
        // If the key is a transaction then return a transaction function.
        if (this.transactions[key]) return (...args: any[]) => this.transactions[key](doc, proxy, args);

        // Otherwise, return the state's key-value.
        return obj[key] = state.get(key);
      },

      set: (obj, key: string, value) => {
        // If the key is a transaction then throw an error.
        if (this.transactions[key]) return false;
        
        // Otherwize, set the state's key-value.
        obj[key] = state.set(key, value);
        return true;
      }
    });

    // TODO - Only apply defaults if this is the first time this store's state is created.
    const defaults = this.defaults();
    for (const key in defaults) proxy[key] = defaults[key];

    return proxy as any;
  }
}
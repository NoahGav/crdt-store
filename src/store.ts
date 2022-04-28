import * as t from "./types"
import * as Y from 'yjs';

export class Store<
  TSchema extends t.ObjectSchema,
  TTransactions extends t.Transactions
> {
  private options: t.OpenOptions<TSchema>;
  private transactions: TTransactions;

  private constructor(def?: {
    options?: t.OpenOptions<TSchema>,
    transactions?: TTransactions
  }) {
    this.options = (def?.options ?? {}) as t.OpenOptions<TSchema>;
    this.transactions = (def?.transactions ?? {}) as TTransactions;
  }

  /** Creates a new store with the given options. */
  static open<TSchema extends t.ObjectSchema>(
    options: t.OpenOptions<TSchema>
  ): Store<TSchema, {}> {
    return new Store({ options: options });
  }

  /** Adds a transaction to the store. */
  transaction<
    TName extends string,
    TInput extends t.Schema
  >(
    transaction: t.Transaction<TName, TSchema, TInput>
  ): Store<
    TSchema,
    TTransactions & Record<TName, typeof transaction>
  > {
    this.transactions[transaction.name] = transaction as any;
    return this;
  }

  /** Loads (or creates) the store's state based on the given options. */
  checkout(options: t.CheckoutOptions): t.CheckoutType<TSchema, TTransactions> {
    const doc = new Y.Doc();
    const state = doc.getMap();
    const proxy = {} as Record<string, any>;

    // TODO - Only set default values if this store is being created for the first time.
    const values = this.options.default();
    for (const key in values) state.set(key, values[key]);

    // Add the getters and setters for the state's properties.
    const schema = this.options.schema as any;
    const props = schema.parse ? schema.shape : schema.isValid ? schema.fields : null;

    for (const prop in props) {
      Object.defineProperty(proxy, prop, {
        get() {
          return state.get(prop);
        },

        set(value) {
          // TODO - Validate schema.
          state.set(prop, value);
        },

        enumerable: true
      });
    }

    // Create the transaction functions.
    for (const key in this.transactions) {
      Object.defineProperty(proxy, key, {
        value: (input: any) => {
          // TODO - Validate input schema.
          Y.transact(doc, () => this.transactions[key].transact(proxy, input));
        },

        enumerable: true
      });
    }

    // TODO - Currently this works. The only problem is that since it is not recursive we cannot
    //        check to see if the value passed into the setter matches the schema that was defined.
    //
    // TODO - Add support for when options.library is either vue or react. What this will
    //        do is simply return the vue or react equivalent of the proxy so that you can
    //        use the state like normal and it will work automatically with vue/react.
    //
    // TODO - When a store's state is first created (not loaded) we need to set the doc's values
    //        to the store's default values.
    //
    // TODO - Validate default values against this.options.schema.

    return proxy as any;
  }
}
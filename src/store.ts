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
    // TODO - Load doc from db if the options say so.
    const doc = new Y.Doc();
    const state = doc.getMap();
    const proxy = {} as Record<string, any>;

    const values = this.options.default();
    for (const key in values) state.set(key, values[key]);

    if ((this.options.schema as t.ZodSchema).parse) {
      const shape = (this.options.schema as t.ZodObjectSchema).shape;

      for (const key in shape) {
        // TODO - Check object schema for shape function. If it exists
        //        shape[key] is a map and we need to recurse.
        Object.defineProperty(proxy, key, {
          get() {
            return state.get(key);
          },

          set(value) {
            return state.set(key, value);
          },

          enumerable: true
        });
      }
    }

    for (const key in this.transactions) {
      Object.defineProperty(proxy, key, {
        value: (input: any) => {
          // TODO - Validate input schema.
          Y.transact(doc, () => this.transactions[key].transact(proxy, input));
        },

        enumerable: true
      });
    }

    return proxy as any;

    // // TODO - Add support for when options.library is either vue or react. What this will
    // //        do is simply return the vue or react equivalent of the proxy so that you can
    // //        use the state like normal and it will work automatically with vue/react.
    // //
    // // TODO - When a store's state is first created (not loaded) we need to set the doc's values
    // //        to the store's default values.
    // //
    // // TODO - validate default values against this.options.schema.
    // //
    // // TODO - Create the proxy simply by looping through this.options.schema and defining a property
    // //        with a getter and setter for each property recursively. Also, add transaction functions.

    // const values = this.options.default();
    // state.set('name', values.name);
    // state.set('users', values.users);
    
    // Object.defineProperties(proxy, {
    //   name: {
    //     get() {
    //       // TODO - If the value that we get is not valid to our schema then we should
    //       //        set the value to the default and return that or something (maybe something else).
    //       return state.get('name');
    //     },
  
    //     set(value) {
    //       // TODO - Validate input schema.
    //       state.set('name', value);
    //     },

    //     enumerable: true
    //   },

    //   users: {
    //     get() {
    //       return state.get('users');
    //     },

    //     set(value) {
    //       return state.set('users', value);
    //     },

    //     enumerable: true
    //   },

    //   setName: {
    //     value: (input: string) => {
    //       // TODO - Validate input schema.
    //       Y.transact(doc, () => this.transactions['setName'].transact(proxy, input));
    //     },

    //     enumerable: true
    //   },

    //   addUser: {
    //     value: (input: string) => {
    //       // TODO - Validate input schema.
    //       Y.transact(doc, () => this.transactions['addUser'].transact(proxy, input));
    //     },

    //     enumerable: true
    //   }
    // });

    // return proxy as any;
  }
}
import { createProxy } from "./proxy";
import * as t from "./types"
import * as Y from 'yjs';
import { Infer } from "./types";

export class Store<
  TSchema extends t.ObjectSchema,
  TTransactions extends t.Transactions
> {
  private schema: TSchema;
  private transactions: TTransactions;

  private constructor(def?: {
    schema?: TSchema,
    transactions?: TTransactions
  }) {
    this.schema = (def?.schema ?? {}) as TSchema;
    this.transactions = (def?.transactions ?? {}) as TTransactions;
  }

  /** Creates a new store with the given options. */
  static open<TSchema extends t.ObjectSchema>(
    options: t.OpenOptions<TSchema>
  ): Store<TSchema, {}> {
    return new Store({
      schema: options.schema
    });
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

  /** Creates or loads the store's state based on the given options. */
  checkout(
    options: t.CheckoutOptions
  ): Readonly<
    t.Infer<TSchema> &
    { [K in keyof TTransactions]: (input: Infer<TTransactions[K]['input']>) => void }
  > {
    // TODO - Initialize state using the options.
    const state = new Y.Doc();

    // Create two state proxies, one readonly, one not.
    const proxy = createProxy(state, this.schema, false);
    const roProxy = createProxy(state, this.schema, true);

    // Add the transactions.
    for (const key in this.transactions) {
      const transaction = this.transactions[key];
      
      roProxy[transaction.name] = (input: any) => {
        // TODO - Verify the input with the input schema.
        transaction.transact(proxy, input);
      };
    }

    return roProxy as any;
  }
}
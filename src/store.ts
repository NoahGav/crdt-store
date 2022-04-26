import { CheckoutOptions, OpenOptions, Schema, Transaction, Transactions } from "./types"

export class Store<
  TSchema extends Schema,
  TTransactions extends Transactions
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
  static open<TSchema extends Schema>(
    options: OpenOptions<TSchema>
  ): Store<TSchema, {}> {
    return new Store({
      schema: options.schema
    });
  }

  /** Adds a transaction to the store. */
  transaction<
    TName extends string,
    TInput extends Schema
  >(
    transaction: Transaction<TName, TSchema, TInput>
  ): Store<
    TSchema,
    TTransactions & Record<TName, typeof transaction>
  > {
    this.transactions[transaction.name] = transaction as any;
    return this;
  }

  /** Creates or loads the store's state based on the given options. */
  checkout(options: CheckoutOptions) {
    // TODO - The options should include the providers and any db.
    // TODO - Create or load the store's state based on the given options and
    //        return a proxy object.
  }
}
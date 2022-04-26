import { Infer, Mutation, Schema, Transaction, Transactions } from "./types";

/**
 * A store defines the schema and the transactions for a crdt
 * (conflict free replicated data type). A store's state can be
 * shared by any number of clients. Whether the clients are online or
 * offline, the store's state will automatically be synced between
 * them.
 */
export class Store<
  TSchema extends Schema,
  TTransactions extends Transactions = {}
> {
  private schema: TSchema;
  private transactions: TTransactions;

  constructor(def?: {
    schema: TSchema,
    transactions?: TTransactions
  }) {
    this.schema = (def?.schema ?? {}) as TSchema,
    this.transactions = (def?.transactions ?? {}) as TTransactions
  }

  /** Creates a store with the given schema. */
  static create<TSchema extends Schema>(schema: TSchema): Store<TSchema> {
    return new Store({ schema });
  }

  /**
   * Adds a new transaction to this store. A transaction applies
   * one or more mutations to the store's state. The mutations
   * can be applied whether or not the client is online. The
   * state will automatically be synchronized when the client
   * comes back online.
   */
  transaction<
    TName extends string,
    TInput extends Schema
  >(
    name: TName,
    input: TInput,
    mutate: Mutation<TSchema, TInput>
  ): Store<
    TSchema,
    TTransactions & Record<TName, Transaction<TSchema, TInput>>
  > {
    // TODO - Merge this store and the new store with the transaction.
    return new Store();
  }

  /** 
   * Creates (or loads if it already exists) the store
   * with the given id and returns it's state.
   */
  checkout(id: string): Readonly<Infer<TSchema>> {
    // TODO - checkout the store with the given id.
    //        This store is either created or loaded
    //        from some kind of database. The way
    //        it is loaded, saved, and updated needs
    //        to be generic. The object returned from
    //        this needs to be a readonly proxy where
    //        the only changes that are allowed come
    //        from the transaction functions.
    return {} as any;
  }
}
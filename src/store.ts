import { z } from "zod";
import { Infer, Schema, Transaction, Transactions } from "./types";

/**
 * A store defines the schema and the transactions for a crdt
 * (conflict free replicated data type). A store's state can be
 * shared by any number of clients. Whether the clients are online or
 * offline, the store's state will automatically be synced between
 * them.
 */
class Store<
  TSchema extends Schema,
  TTransactions extends Transactions = {}
> {
  _def: {
    schema?: TSchema,
    transactions: TTransactions
  };

  constructor(def?: {
    schema?: TSchema,
    transactions?: TTransactions
  }) {
    this._def = {
      schema: def?.schema,
      transactions: (def?.transactions ?? {}) as TTransactions
    };
  }

  /** Creates a store (with an optional schema). */
  static create(): Store<any>;
  static create<TSchema extends Schema>(schema?: TSchema): Store<TSchema>;
  static create<TSchema extends Schema>(schema?: TSchema): Store<TSchema> {
    return new Store({ schema });
  }

  /** Adds a new transaction to this store (with an optional input schema). */
  transaction<
    TName extends string
  >(
    name: TName,
    transaction: Transaction<TSchema, any>
  ): Store<
    TSchema,
    TTransactions & Record<TName, typeof transaction>
  >;

  transaction<
    TName extends string,
    TInput extends Schema
  >(
    name: TName,
    input: TInput,
    transaction: Transaction<TSchema, TInput>
  ): Store<
    TSchema,
    TTransactions & Record<TName, typeof transaction>
  >;

  transaction(name: string, inputOrTransaction: unknown, maybeTransaction?: unknown) {
    // TODO - Merge this store and the new store with the transaction.
    return new Store();
  }
}

// TODO - Remove.
const store = Store
  .create(z.object({
    name: z.string(),
    users: z.set(z.string())
  }))
  .transaction('setName', z.string(), (store, newName) => {
    store.name = newName;
  })
  .transaction('addUser', z.string(), (store, userId) => {
    store.users.add(userId);
  })
  .transaction('removeUser', z.string(), (store, userId) => {
    store.users.delete(userId);
  });
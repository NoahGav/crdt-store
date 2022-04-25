import { z } from "zod";
import { Infer, Mutation, Schema, Transaction, Transactions } from "./types";

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
    schema: TSchema,
    transactions: TTransactions
  };

  constructor(def?: {
    schema: TSchema,
    transactions?: TTransactions
  }) {
    this._def = {
      schema: (def?.schema ?? {}) as TSchema,
      transactions: (def?.transactions ?? {}) as TTransactions
    };
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
}

// TODO - Remove.
const store = Store
  .create(z.object({
    name: z.string(),
    users: z.set(z.string())
  }))
  .transaction('setName', z.string(), (state, newName) => {
    state.name = newName;
  })
  .transaction('addUser', z.string(), (state, userId) => {
    state.users.add(userId);
  })
  .transaction('removeUser', z.string(), (state, userId) => {
    state.users.delete(userId);
  });
import { z } from "zod";
import * as yup from 'yup';
import * as superstruct from 'superstruct';
import { Infer, Mutation, Schema, SuperStructSchema, Transaction, Transactions, YupSchema, ZodSchema } from "./types";

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
    // Merge this transaction with the existing transactions.
    this.transactions = {
      ...this.transactions,
      [name]: { input, mutate }
    };

    return this;
  }

  /** 
   * Creates (or loads if it already exists) the store
   * with the given id and returns it's state.
   */
  checkout<
    TState extends Readonly<
      Infer<TSchema> &
      { [K in keyof TTransactions]: (input: Infer<TTransactions[K]['input']>) => void }
    >
  >(id: string): TState {
    const state = {};
    return state as TState;
  }
}
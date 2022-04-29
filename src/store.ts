import * as t from './types';
import * as Y from 'yjs';
import { State } from './state';

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
import * as t from './types';
import * as Y from 'yjs';
import { State } from './state';

// TODO - Document.
export class Store<TState, TTransactions extends t.TransactionRecord> {
  transactions: Record<string, (doc: any, proxy: any, args: any[]) => void> = {};

  static open<TState>(): Store<Partial<TState>, {}> {
    return new Store();
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
export type Transact<TState> = (state: TState, ...args: any[]) => void;
export type AnyTransact = Transact<any>;

export type Transaction<TState, TName extends string, TTransact extends Transact<TState>> = {
  name: TName;
  transact: TTransact;
}

export type AnyTransaction = Transaction<any, any, any>;
export type TransactionRecord = Record<string, AnyTransaction>

export type TransactArgs<TTransact extends Transact<any>>
  = Parameters<TTransact> extends [infer _, ...infer TArgs] ? TArgs : never;

export type Transactions<TTransactions extends TransactionRecord>
  = { [K in keyof TTransactions]: (...args: TransactArgs<TTransactions[K]['transact']>) => void };

export type OpenOptions<TState> = {
  defaults: () => TState;
};

export type Library = 'none' | 'react' | 'vue';

export type CheckoutOptions = {
  /** (Optional) The reactive rendering library you are using. */
  library?: Library;
};
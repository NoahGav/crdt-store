import { z } from 'zod';
import * as yup from 'yup';

export { z } from 'zod';
export * as yup from 'yup';

export type ZodSchema = z.Schema;
export type YupSchema = yup.AnySchema;
export type Schema = ZodSchema | YupSchema;

export type ZodObjectSchema = z.ZodObject<any>;
export type YupObjectSchema = yup.AnyObjectSchema;
// TODO - Figure out.
export type ObjectSchema = ZodObjectSchema | YupObjectSchema;

export type Infer<TSchema extends Schema>
  = TSchema extends ZodSchema ? z.infer<TSchema>
  : TSchema extends YupSchema ? yup.InferType<TSchema>
  : never;

export type OpenOptions<TSchema extends ObjectSchema> = {
  /** The store's shared state schema. */
  schema: TSchema;

  /** The store's initial value. */
  default: () => Infer<TSchema>;
};

export type Transaction<
  TName extends string,
  TSchema extends Schema,
  TInput extends Schema
> = {
  /** The name of the transaction. */
  name: TName;

  /** (Optional) The transactions input schema. */
  input?: TInput;

  /** The function that handles the transaction. */
  transact: (state: Infer<TSchema>, input: Infer<TInput>) => void;
};

export type AnyTransaction = Transaction<any, any, any>
export type Transactions = Record<string, AnyTransaction>;

export type Library = 'none' | 'react' | 'vue';

export type CheckoutOptions = {
  /** (Optional) The reactive rendering library you are using ('react' or 'vue'). */
  library?: Library;
};

export type CheckoutType<
  TSchema extends ObjectSchema,
  TTransactions extends Transactions
> = Infer<TSchema> & { [K in keyof TTransactions]: (input: Infer<TTransactions[K]['input']>) => void };
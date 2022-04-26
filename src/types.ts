import { z } from 'zod';
import * as yup from 'yup';
import * as superstruct from 'superstruct';

export type ZodSchema = z.Schema;
export type YupSchema = yup.AnySchema;
export type SuperStructSchema = superstruct.Struct<any, any>;
export type Schema = ZodSchema | YupSchema | SuperStructSchema;

export type ZodObjectSchema = z.ZodObject<any>;
export type YupObjectSchema = yup.AnyObjectSchema;
export type SuperStructObjectSchema = superstruct.Struct<any, any>;
export type ObjectSchema = ZodObjectSchema | YupObjectSchema | SuperStructObjectSchema;

export type Infer<TSchema extends Schema>
  = TSchema extends ZodSchema ? z.infer<TSchema>
  : TSchema extends YupSchema ? yup.InferType<TSchema>
  : TSchema extends SuperStructSchema ? superstruct.Infer<TSchema>
  : never;

export type OpenOptions<TSchema extends ObjectSchema> = {
  schema: TSchema;
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

export type CheckoutOptions = {

};
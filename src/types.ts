import { z } from 'zod';
import * as yup from 'yup';
import * as superstruct from 'superstruct';

export type ZodSchema = z.Schema;
export type YupSchema = yup.AnySchema;
export type SuperStructSchema = superstruct.Struct<any, any>;
export type Schema = ZodSchema | YupSchema | SuperStructSchema;

export type Infer<TSchema extends Schema>
  = TSchema extends ZodSchema ? z.infer<TSchema>
  : TSchema extends YupSchema ? yup.InferType<TSchema>
  : TSchema extends SuperStructSchema ? superstruct.Infer<TSchema>
  : never;

export type Mutation<TSchema extends Schema, TInput extends Schema>
  = (state: Infer<TSchema>, input: Infer<TInput>) => void;

export type Transaction<TSchema extends Schema, TInput extends Schema> = {
  input: TInput;
  mutate: Mutation<TSchema, TInput>;
}

export type AnyTransaction = Transaction<any, any>;
export type Transactions = Record<string, AnyTransaction>;
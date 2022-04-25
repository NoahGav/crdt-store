import { z } from 'zod';
import * as yup from 'yup';
import * as superstruct from 'superstruct';

export type Schema = z.Schema | yup.AnySchema | superstruct.Struct<any, any>;

export type Infer<TSchema extends Schema>
  = TSchema extends z.Schema ? z.infer<TSchema>
  : TSchema extends yup.AnySchema ? yup.InferType<TSchema>
  : TSchema extends superstruct.Struct<any, any> ? superstruct.Infer<TSchema>
  : never;

export type Mutation<TSchema extends Schema, TInput extends Schema>
  = (state: Infer<TSchema>, input: Infer<TInput>) => void;

export type Transaction<TSchema extends Schema, TInput extends Schema> = {
  input: TInput;
  mutate: Mutation<TSchema, TInput>;
}

export type AnyTransaction = Transaction<any, any>;
export type Transactions = Record<string, AnyTransaction>;
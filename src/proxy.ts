import { Schema } from "./types";
import * as Y from 'yjs';

export function createProxy(state: Y.Doc, schema: Schema, readonly: boolean) {
  // TODO - Should normalize the schema and then build a (readonly) proxy.
  return {} as Record<string, any>;
}

function normalizeSchema(schema: Schema) {
  // TODO - This function takes in a schema (zod, yup, or superstruct)
  //        and should return an object of some kind that represents that
  //        schema in a generic way.
}

// if ((this.schema as ZodSchema).parse) {
//   const zodObject = this.schema as ZodObjectSchema;
//   console.log(zodObject.shape);
//   // TODO - Test yup and superstruct for the same abilities. Assuming
//   //        they work then create a function that will convert them to
//   //        a generic shape that I can use for this function the create
//   //        the proxies.
// } else if ((this.schema as YupSchema).isValid) {
//   // TODO - 
// } else if ((this.schema as SuperStructSchema).validate) {
//   // TODO - 
// }